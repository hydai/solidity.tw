# 實例解析 - Proof of Stake 書籍的捐款合約 Part 7 (final)

## 合約原始碼

[合約原始碼請點此](https://etherscan.io/address/0x5bf5bcc5362f88721167c1068b58c60cad075aac#code)

### `ProofOfStake_Pages.sol` 引用的函式庫與介面

ProofOfStake_Pages 合約中引入的函式庫與介面，可以看到以下的結構(`*` 為本日說明的範圍)

```solidity
ProofOfStake_Pages*
|- (Part 3) Ownable.sol
|  |- (Part 2) Context.sol
|- (Part 3) ReentrancyGuard.sol
|- (Part 6) ERC721Enumerable.sol
|  |- (Part 6) ERC721.sol
|  |  |- (前文) IERC721.sol
|  |     |- (Part 5) IERC165.sol
|  |  |- (Part 5) IERC721Receiver.sol
|  |  |- (前文) IERC721Metadata.sol
|  |  |- (Part 4) Address.sol
|  |  |- (Part 2) Context.sol
|  |  |- (Part 2) Strings.sol
|  |  |- (Part 5) ERC165.sol
|  |- (前文) IERC721Enumerable.sol
|  |  |- (前文) IERC721.sol
|  |     |- (Part 5) IERC165.sol
|- (Part 2) Strings.sol
|- (Part 2) Counters.sol
|- (Part 1) base64.sol
|- (Part 1)Transforms.sol
```

### 主菜：`ProofOfStake_Pages.sol`

這個 NFT 在設計時引入的 Soulbound (靈魂綁定的概念)，因此在 NFT 被鑄造出來後，便禁止轉移與授權相關的函式，只有捐款者本人才能持有。

細節請看程式碼註解。

```solidity
pragma solidity >=0.8.0 <0.9.0;

//SPDX-License-Identifier: Apache-2.0
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import {Base64} from "base64-sol/base64.sol";
import {Transforms} from "./libs/Transforms.sol";

// 宣告錯誤型態
error Soulbound(); // 靈魂綁定
error PledgingDisabled(); // 關閉捐款
error NotMinimumPledge(); // 未達最低捐款額度
error SendFailed(); // 發送失敗
error InvalidSignature(); // 不合法的簽名
error ZeroSignature(); // address 0 的簽名
error DoesNotExist(); // 不存在

// 提供將 addresses 解碼成對應的 ENS 的介面
abstract contract ENS_Resolver {
    function getNames(address[] calldata addresses)
        external
        view
        virtual
        returns (string[] memory);
}

// 本合約繼承了 ERC721Enumerable, Ownable, 與 ReentrancyGuard 三大合約，而他們彼此還有各自的繼承，可以從前幾篇文章找到
contract ProofOfStake_Pages is ERC721Enumerable, Ownable, ReentrancyGuard {
    ENS_Resolver res = ENS_Resolver(0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C);

    using Counters for Counters.Counter;
    using Strings for uint256;

    /*///////////////////////////////////////////////////////////////
                            TOKEN STORAGE
    //////////////////////////////////////////////////////////////*/

    Counters.Counter private _tokenIds;

    bool public pledgeOpen;

    // confirm with team
    uint256 internal constant price = 0.0001337 ether;

    uint256 internal constant tokenlimitperuser = 1;

    uint256 internal constant publisherSplit = 10;

    mapping(address => uint256) public pledgeLimit;

    mapping(address => uint256) public udonationTotal;

    //prettier-ignore
    address internal immutable gitcoin = 0xde21F729137C5Af1b01d73aF1dC21eFfa2B8a0d6;

    //prettier-ignore
    address internal immutable sevenStories = 0x209D3040C2dEdcb7124be89Fc6849423621EdeaC;

    string public contractAddressString =
        Transforms.toAsciiString(address(this));

    string public currentMessage;

    // 定義 NFT 的資料結構
    struct Token {
        string recipient;
        address rAddress;
        string sigValue;
        string timestamp;
        string writtenMsg;
    }

    Token[] private tokens;

    /*///////////////////////////////////////////////////////////////
                               EVENTS
    //////////////////////////////////////////////////////////////*/

    event Pledge(address indexed pledgee, uint256 indexed pledgeValue);

    /*///////////////////////////////////////////////////////////////
                           EIP-712 STORAGE
    //////////////////////////////////////////////////////////////*/

    // 寫死 vitalik 的位址
    //prettier-ignore
    address internal immutable vitalik = 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045;

    uint256 internal immutable INITIAL_CHAIN_ID;

    bytes32 internal immutable INITIAL_DOMAIN_SEPARATOR;

    bytes32 public constant AUTOGRAPH_TYPEHASH =
        keccak256(
            "signature(address sender,address recipient,string pledge,string timestamp,string msg)"
        );

    /*///////////////////////////////////////////////////////////////
                              STRUCTOR
    //////////////////////////////////////////////////////////////*/

    // 建構子，允許在建構新合約的當下，鑄造已經捐款者的 NFT
    constructor(address[] memory _donors, uint256[] memory _amounts)
        ERC721("Proof Of Stake Pages", "PoSp")
    {
        transferOwnership(0xb010ca9Be09C382A9f31b79493bb232bCC319f01);

        // 設定發行此合約的 chain id 用來驗證簽名
        INITIAL_CHAIN_ID = block.chainid;
        INITIAL_DOMAIN_SEPARATOR = computeDomainSeparator();

        // 發行 NFT 給已經捐款者
        for (uint256 i = 0; i < _donors.length; ++i) {
            pledgeLimit[_donors[i]] = pledgeLimit[_donors[i]] + 1;

            string memory resolved = resolveENS(_donors[i]);

            udonationTotal[_donors[i]] += _amounts[i];

            _tokenIds.increment();
            uint256 id = _tokenIds.current();

            _mint(_donors[i], id);

            tokens.push(
                Token({
                    recipient: resolved,
                    rAddress: _donors[i],
                    sigValue: _amounts[i].toString(),
                    timestamp: block.timestamp.toString(),
                    writtenMsg: "Thank you for believing."
                })
            );

            emit Pledge(_donors[i], _amounts[i]);
        }
    }

    /*///////////////////////////////////////////////////////////////
                             PLEDGE LOGIC
    //////////////////////////////////////////////////////////////*/

    // 捐款（原則上，這個合約的 NFT 是在這邊被鑄造出來的）
    /**
     * @notice Pledges ETH to GTC & "whitelists" pledger
     */
    //prettier-ignore
    function pledge() public payable nonReentrant {
        // 若捐款關閉中，則觸發錯誤
        if (pledgeOpen == false) revert PledgingDisabled();
        
        // 若捐款的錢低於門檻，觸發錯誤
        if (msg.value < price) revert NotMinimumPledge();

        string memory resolved = resolveENS(msg.sender);

        // 計算發行商的分潤
        uint sShare = (msg.value * publisherSplit) / 100;

        // 若呼叫者捐款多次，會更新在 NFT 上
        if (pledgeLimit[msg.sender] >= tokenlimitperuser) {
            // 發送部分收入給 gitcoin
            (bool success3, ) = gitcoin.call{value: msg.value - sShare}("");
            if (!success3) revert SendFailed();
        
            // 發送分潤給發行商 sevenStories
            (bool success4, ) = sevenStories.call{value: sShare}("");
            if (!success4) revert SendFailed();
        
            // 更新捐款紀錄
            udonationTotal[msg.sender] +=  msg.value;

            // 更新捐款次數
            pledgeLimit[msg.sender] = pledgeLimit[msg.sender] + 1;

            return;
        }

        // 反之，這是呼叫者的第一次捐款
        // 先發送部分收入給 gitcoin
        (bool success, ) = gitcoin.call{value: msg.value - sShare}("");
        if (!success) revert SendFailed();

        // 再發送分潤給發行商 sevenStories
        (bool success2, ) = sevenStories.call{value: sShare}("");
        if (!success2) revert SendFailed();

        // 更新發送者的捐款紀錄
        udonationTotal[msg.sender] +=  msg.value;

        // 更新發送者的捐款次數
        pledgeLimit[msg.sender] = pledgeLimit[msg.sender] + 1;

        // 建立新的 token ID
        _tokenIds.increment();
        // 取得新的 token ID
        uint256 id = _tokenIds.current();

        // 利用新 ID 來鑄造 NFT 給捐款者
        _mint(msg.sender, id);

        // 將新代幣加入代幣列表中
        tokens.push(Token({
                recipient: resolved, /* 捐款者的 ENS */
                rAddress: msg.sender, /* 捐款者的位址 */
                sigValue: msg.value.toString(), /* 捐款者的捐款數量 */
                timestamp: block.timestamp.toString(), /* 捐款當下區塊的時間 */
                writtenMsg: currentMessage /* 當前 Vitalik 留下的訊息 */
            }));

        // 觸發捐款事件
        emit Pledge(msg.sender, msg.value);
    }

    // 設定訊息
    // 只有 vitalik 才能觸發
    function setMessage(string calldata _message) external {
        require(msg.sender == vitalik);
        require(bytes(_message).length <= 60);

        currentMessage = _message;
    }

    // 解析特定位址對應的 ENS 
    function resolveENS(address _user) internal view returns (string memory) {
        string memory resolved;

        address[] memory forCall = new address[](1);

        forCall[0] = _user;

        string[] memory callres = res.getNames(forCall);

        if (bytes(callres[0]).length == 0) {
            resolved = string.concat("0x", Transforms.toAsciiString(_user));
        } else {
            resolved = callres[0];
        }

        return resolved;
    }

    // 更新使用者的 NFT，當本合約收到來自 Vitalik 的合法簽名訊息
    /**
     * @notice Updates the user token if we have a valid msg from Vitalik
     */
    //prettier-ignore
    function updateIfSigned(
        bytes calldata _signature,
        string calldata _sigValue,
        string calldata _timestamp,
        string calldata _message
    ) external nonReentrant {

        (uint8 v, bytes32 r, bytes32 s) = Transforms.splitSignature(_signature);

        bytes32 hashStruct = keccak256(
            abi.encode(
                AUTOGRAPH_TYPEHASH,
                // Will be wockis address in live v
                vitalik,
                // Signature will be invalid if it isn't to caller &&
                // EIP712: "Addresses are encoded as uint160"
                uint160(msg.sender),
                // EIP712: "values bytes and string are encoded as a keccak256 hash"
                keccak256(bytes(_sigValue)),
                keccak256(bytes(_timestamp)),
                keccak256(bytes(_message))
            )
        );

        bytes32 hash = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR(), hashStruct)
        );
        address signer = ecrecover(hash, v, r, s);

        if (signer != vitalik) revert InvalidSignature();
        if (signer == address(0)) revert ZeroSignature();

        uint256 tokenid = tokenOfOwnerByIndex(msg.sender, 0) - 1;

        tokens[tokenid].writtenMsg = _message;
    }

    // 切換捐款開關
    /**
     * @notice Toggles Pledging On / Off
     */
    function togglePledging() public onlyOwner {
        pledgeOpen == false ? pledgeOpen = true : pledgeOpen = false;
    }

    /*///////////////////////////////////////////////////////////////
                            TOKEN LOGIC
    //////////////////////////////////////////////////////////////*/

    // 由於本合約發出的 NFT 為靈魂綁定代幣，因此封印轉移相關函式
    /**
     * @notice SOULBOUND: Block transfers.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721Enumerable) {
        require(
            from == address(0) || to == address(0),
            "SOULBOUND: Non-Transferable"
        );
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // 由於本合約發出的 NFT 為靈魂綁定代幣，因此封印授權相關函式
    /**
     * @notice SOULBOUND: Block approvals.
     */
    function setApprovalForAll(address operator, bool _approved)
        public
        virtual
        override(ERC721, IERC721)
    {
        revert Soulbound();
    }

    // 由於本合約發出的 NFT 為靈魂綁定代幣，因此封印授權相關函式
    /**
     * @notice SOULBOUND: Block approvals.
     */
    function approve(address to, uint256 tokenId)
        public
        virtual
        override(ERC721, IERC721)
    {
        revert Soulbound();
    }

    // 用來產生 SVG 的函式，只需要留意裡面用到的變數即可
    /**
     * @notice Generate SVG using tParams by index
     */
    function generateSVG(uint256 id) private view returns (bytes memory) {
        bytes memory eth;

        bytes memory message;

        if (bytes(tokens[id].writtenMsg).length == 0) {
            message = bytes.concat(
                abi.encodePacked(
                    '<tspan text-anchor="middle" x="37.5%" y="120">',
                    "</tspan>"
                )
            );
        } else {
            message = bytes.concat(
                abi.encodePacked(
                    '<tspan text-anchor="middle" x="37.5%" y="120">"',
                    tokens[id].writtenMsg,
                    '"</tspan>'
                )
            );
        }

        uint256 eth1 = udonationTotal[tokens[id].rAddress];

        uint256 eth3 = eth1 / 1 ether;

        if (eth1 <= 999999999999999999) {
            eth = bytes.concat(
                abi.encodePacked(
                    '<tspan text-anchor="middle" x="37.5%" y="260">',
                    eth1.toString(),
                    " (wei)",
                    "</tspan>"
                )
            );
        } else {
            eth = bytes.concat(
                abi.encodePacked(
                    '<tspan text-anchor="middle" x="37.5%" y="260">',
                    eth3.toString(),
                    " (eth)",
                    "</tspan>"
                )
            );
        }

        return
            bytes.concat(
                abi.encodePacked(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="606.2" height="819.4" viewBox="0 0 606.2 819.4"><defs><style>.a{fill:#fff;}.b{fill:none;stroke:#d9c8db;stroke-miterlimit:10;stroke-width:2px;}.c,.d,.e,.f,.g,.h,.i,.j,.k,.l,.m,.n,.o{isolation:isolate;}.c,.d,.e,.f,.g,.i,.j,.k{font-size:55px;}.c,.e{fill:#e96b5d;}.c,.d,.e,.f,.g,.k{font-family:LustDisplay-Didone, Lust Didone;}.d,.f{fill:#9b4a8d;}.e{letter-spacing:0.02em;}.f{letter-spacing:0.02em;}.g{fill:#9b4a8c;}.h{font-size:45px;fill:#0cb6ea;font-family:Lust-Italic, Lust;font-style:italic;}.i,.k{fill:#50ae58;}.i,.j{font-family:Lust-Regular, Lust;letter-spacing:0.05em;}.j{fill:#ef8916;}.l,.m{font-size:29.99px;}.l,.n{font-family:Arial-BoldMT, Arial;font-weight:700;}.m,.o{font-family:ArialMT, Arial; margin-left: auto; margin-right: auto; width: 40%;}.n{font-size:20px;}.o{font-size:18px;}</style></defs><rect class="a" width="606.2" height="819.4"/><text class="n"><tspan class="n" text-anchor="middle" x="50%" y="42%">',
                    tokens[id].recipient,
                    '</tspan></text><text transform="translate(75 352.85)" font-size="18" font-family="ArialMT, Arial"><tspan text-anchor="middle" x="37.5%" y="200">',
                    tokens[id].timestamp,
                    "</tspan>",
                    eth
                ),
                abi.encodePacked(
                    '<tspan text-anchor="middle" x="37.5%" y="320">0x',
                    contractAddressString,
                    "</tspan>",
                    message,
                    '<tspan text-anchor="middle" x="37.5%" y="220">mint timestamp</tspan>',
                    '<tspan text-anchor="middle" x="37.5%" y="340">contract</tspan>',
                    '<tspan text-anchor="middle" x="37.5%" y="280">value</tspan><tspan text-anchor="middle" x="37.5%" y="140"></tspan></text>',
                    '<rect class="b" x="21.9" y="169.5" width="562.4" height="562.4"/><g style="isolation:isolate"><path d="M46.66,98.93v-.28h4.89V60.71H46.66v-.28H65.91c12,0,18.42,3.19,18.42,11.17,0,9.4-11.77,11.27-19.85,11.27h-1.6V98.65h5.83v.28ZM62.88,82.6h1.6c5.83,0,7.75-3.47,7.75-11s-1.92-10.89-7.75-10.89h-1.6Z" style="fill:#e96b5d"/></g><g style="isolation:isolate"><path d="M135,91.84c0,5.16-2.26,7.53-9.21,7.53-6.74,0-9.43-2.28-11.55-8.63C113,87,112.44,79.52,107.52,79.52h-1.6V98.65h5.28v.28H89.7v-.28h4.89V60.71H89.7v-.28H109c5.66,0,18.47.22,18.47,9.46,0,7.54-10.77,9.27-17.32,9.54v.09c10.75,0,13.94,3.52,16.58,9.15,3.33,7.12,4.13,8.17,5.53,8.17,2.2,0,2.47-3.35,2.47-5Zm-29-12.6h1.6c5.44,0,7.81-2.86,7.81-9.35,0-5.11-1.82-9.18-7.79-9.18h-1.62Z" style="fill:#9b4a8d"/></g><g style="isolation:isolate"><path d="M178.65,79.68c0,12.54-8.85,19.69-19.71,19.69s-19.72-7.15-19.72-19.69S148.07,60,158.94,60,178.65,67.14,178.65,79.68Zm-11.8,0c0-8.41-.52-19.41-7.91-19.41S151,71.27,151,79.68s.52,19.41,7.92,19.41S166.85,88.1,166.85,79.68Z" style="fill:#e96b5d"/></g><g style="isolation:isolate"><path d="M226.68,79.68c0,12.54-8.9,19.69-19.83,19.69S187,92.22,187,79.68,195.92,60,206.85,60,226.68,67.14,226.68,79.68Zm-11.87,0c0-8.41-.52-19.41-8-19.41s-8,11-8,19.41.52,19.41,8,19.41S214.81,88.1,214.81,79.68Z" style="fill:#9b4a8d"/></g><g style="isolation:isolate"><path d="M236.69,98.93v-.28h4.89V60.71h-4.89v-.28h33.93L272,73.69h-.27l-.11-1c-.8-7.56-6.82-12-14.3-12h-4.4V79.13h.61c6.18,0,10.2-2.58,10.5-7.72l.05-1h.28l-.93,17.77h-.28l.05-1c.28-5.12-3.49-7.81-9.67-7.81h-.61V98.65h5.83v.28Z" style="fill:#9b4a8c"/></g><g style="isolation:isolate"><path d="M307.71,87.38c0,7.47-6.75,14.17-14.76,14.17-6.43,0-10.89-4.27-10.89-10.21,0-7.7,6.62-14.18,14.72-14.18C303.26,77.16,307.71,81.44,307.71,87.38Zm-8.23-4.64c0-2.65-.5-5.22-2.75-5.22-5,0-6.43,13.86-6.43,18.54,0,2.66.49,5.13,2.7,5.13C298,101.19,299.48,88.05,299.48,82.74Z" style="fill:#0cb6ea"/></g><g style="isolation:isolate"><path d="M300.13,105.46a4.61,4.61,0,0,1,4.68-4.77,3.93,3.93,0,0,1,4.09,4.18,3.26,3.26,0,0,0-2.7,3.29c0,1.08.45,1.93,1.71,1.93,2.12,0,4-2.34,4-5.76,0-2.07-.67-4.32-4-5.49l3.37-22H307.6l0-.36h3.65c.31-6.7,2.52-11.88,9.18-11.88,4.5,0,6.57,2.48,6.57,5.27a4.75,4.75,0,0,1-4.82,5c-2.2,0-4-1.44-4-4.27a3.09,3.09,0,0,0,2.88-3.2c0-1.35-.58-2.29-2.07-2.29-5.31,0-6.84,11.38,1.44,11.38h3.2l0,.36h-4.27L316,98.75c-.86,5.4-3.47,12-9.77,12C302.29,110.72,300.13,108.2,300.13,105.46Z" style="fill:#0cb6ea"/></g><g style="isolation:isolate"><path d="M345.85,98.1l-4.07,1.16-.88-16h.44c.88,6.44,4.45,15.62,14.35,15.62,5,0,9-1.76,9-5.83,0-9.24-24-8.41-24-21.72C340.68,64,347.77,60,356.57,60a39.37,39.37,0,0,1,8.75,1.26l4.18-1.16.71,13.53h-.44c-.88-6.21-4.34-13.19-13.2-13.19-4.4,0-7.42,2.08-7.42,5.66,0,8.41,24,7.09,24,20.79,0,7.75-8.13,12.48-17.43,12.48A41.65,41.65,0,0,1,345.85,98.1Z" style="fill:#50ae58"/><path d="M384.62,98.93v-.44c5.72,0,6.27-3,6.27-9.46V60.88c-8.91,0-12.87,5.33-13.8,13.63h-.44l1.48-14.07H415l1.48,14.07H416c-.93-8.3-4.89-13.63-13.8-13.63V89c0,6.44.55,9.46,6.27,9.46v.44Z" style="fill:#50ae58"/></g><g style="isolation:isolate"><path d="M455.54,88.43c3.46,7.2,5.11,10.06,9.07,10.06v.44H442.18v-.44c5.22,0,4.18-4.18,1.48-9.95l-1.39-3H429.18c-4,8.38-2.59,12.92,3.43,12.92v.44H417.1v-.44c4,0,7.42-4.67,11.71-13.36l12.71-25.79ZM429.45,85H442l-6.11-13.08Z" style="fill:#ef8916"/><path d="M504.71,87.66c4.29,9.51,5.5,10.39,8.14,10.11v.45a36.94,36.94,0,0,1-8.75,1.26c-6.76,0-9.4-2.58-11.43-8.74-1.76-5.34-3.25-11.44-6.77-11.44a4.07,4.07,0,0,0-1.81.46V89c0,6.44.49,9.46,4.56,9.46v.44H467.26v-.44c5.5,0,5.5-3,5.5-9.46V70.33c0-6.65,0-9.46-5.5-9.46v-.43h21.39v.43c-4.07,0-4.56,3-4.56,9.46V79.1l7-7.67c2.36-2.53,5.39-6.16,5.39-8.41,0-1.49-1-2.15-3.63-2.15v-.43h16.66v.43c-7,0-14.68,7.32-18,10.95l-6.48,7a18,18,0,0,1,8.24-2c5.56,0,8.19,3.3,11.44,10.84Z" style="fill:#ef8916"/></g><g style="isolation:isolate"><path d="M552.2,73.69h-.28l-.11-1c-.8-7.56-6.82-12-14.3-12H532V79.13h.61c6.18,0,10.2-2.58,10.5-7.72l.06-1h.27l-.93,17.77h-.28l.06-1c.27-5.12-3.5-7.81-9.68-7.81H532V92c0,5.33.61,6.7,4.4,6.7,9.87,0,16-6.15,17.35-15l.2-1.24h.27l-2.64,16.5h-35.8v-.28h4.89V60.71h-4.89v-.27h35Z" style="fill:#50ae58"/></g><text class="l" transform="translate(235.15 265)">vitalik.eth</text> <text class="m" transform="translate(263.48 295)">signer</text> <text class="m" transform="translate(245.64 373)">recipient</text></svg>'
                )
            );
    }

    // 產生 SVG，以 base64 來編碼
    /**
     * @notice Generate SVG, b64 encode it, construct an ERC721 token URI.
     */
    function constructTokenURI(uint256 id)
        private
        view
        returns (string memory)
    {
        // prettier-ignore

        uint256 cID = id - 1;
        // generateSVG 會將 cID 傳入，用來產生該 id 對應的 SVG
        string memory pageSVG = Base64.encode(bytes(generateSVG(cID)));

        // 建構出完整的 URI JSON
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"signed_to":"',
                                tokens[cID].recipient,
                                '", "external_url":"',
                                "https://proofofstake.gitcoin.co/",
                                '", "timestamp":"',
                                tokens[cID].timestamp,
                                '", "pledge":"',
                                udonationTotal[tokens[cID].rAddress].toString(),
                                '", "message":"',
                                tokens[cID].writtenMsg,
                                '", "image": "',
                                "data:image/svg+xml;base64,",
                                pageSVG,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    // 利用 token ID 建構出 NFT 的 URI 來建構完整的 URI json 
    /**
     * @notice Receives json from constructTokenURI
     */
    // prettier-ignore
    function tokenURI(uint256 id)
        public
        view
        override
        returns (string memory)
    {
        if (!_exists(id)) revert DoesNotExist();
        return constructTokenURI(id);
    }

    // 建構出本合約的 URI
    // 請特別注意，常見的 NFT 在這邊都會給一個連結指向儲存一個 URI schema 的位置，如 ipfs / http
    // 但本合約有趣的地方在於 NFT 本身是以 SVG 的方式文字儲存在區塊鏈上，因此他直接把 URI schema 存在裡面
    function contractURI() external pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode( /* 將以下資料編碼成 base64 格式 */
                        bytes(
                            abi.encodePacked(
                                "{",
                                '"name":"',
                                "Proof of Stake",
                                '",'
                                '"description":"',
                                "Vitalik is committed to supporting open-source public goods, he's releasing a book on September 13. We're pre-gaming by raising funds for public goods with a truly unique NFT, where Vitalik signs a message directly on your token. This token is then inserted into your digital copy upon the books release!",
                                '",'
                                '"image_data":"',
                                // Yeah, looks like CORS may not be letting this resolve, fix l8r
                                "",
                                '",'
                                '"external_link":"',
                                "https://proofofstake.gitcoin.co/",
                                '",'
                                '"seller_fee_basis_points":"',
                                "0",
                                '",'
                                '"fee_recipient":"',
                                "0x00",
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    /*///////////////////////////////////////////////////////////////
                             SIG LOGIC
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice https://eips.ethereum.org/EIPS/eip-712
     */
    function DOMAIN_SEPARATOR() public view virtual returns (bytes32) {
        return
            block.chainid == INITIAL_CHAIN_ID
                ? INITIAL_DOMAIN_SEPARATOR
                : computeDomainSeparator();
    }

    function computeDomainSeparator() internal view virtual returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    keccak256(
                        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                    ),
                    keccak256(bytes("ProofOfStake_Pages")), // 參數： name
                    keccak256(bytes("0")), // 參數： version
                    block.chainid, // 參數： chainId
                    address(this) // 參數： verifyingContract
                )
            );
    }
}
```
