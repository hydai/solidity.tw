# 實例解析 - Proof of Stake 書籍的捐款合約 Part 6

## 合約原始碼

[合約原始碼請點此](https://etherscan.io/address/0x5bf5bcc5362f88721167c1068b58c60cad075aac#code)

### `ProofOfStake_Pages.sol` 引用的函式庫與介面

ProofOfStake_Pages 合約中引入的函式庫與介面，可以看到以下的結構(`*` 為本日說明的範圍)

```solidity
ProofOfStake_Pages
|- (Part 3) Ownable.sol
|  |- (Part 2) Context.sol
|- (Part 3) ReentrancyGuard.sol
|- ERC721Enumerable.sol*
|  |- ERC721.sol*
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

### `ERC721.sol`

基本上這邊的 ERC721 就是標準實作。
請大家直接參考下面的程式碼，我把加上了中文註解方便理解內容。

```solidity
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IERC721.sol";
import "./IERC721Receiver.sol";
import "./extensions/IERC721Metadata.sol";
import "../../utils/Address.sol";
import "../../utils/Context.sol";
import "../../utils/Strings.sol";
import "../../utils/introspection/ERC165.sol";

/**
 * @dev Implementation of https://eips.ethereum.org/EIPS/eip-721[ERC721] Non-Fungible Token Standard, including
 * the Metadata extension, but not including the Enumerable extension, which is available separately as
 * {ERC721Enumerable}.
 */
contract ERC721 is Context, ERC165, IERC721, IERC721Metadata {
    using Address for address;
    using Strings for uint256;

    // 代幣名稱
    // Token name
    string private _name;

    // 代幣簡稱
    // Token symbol
    string private _symbol;

    // 用來儲存 token ID 對 擁有者位址的映射結構
    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;

    // 用來儲存 擁有者位址 對 token 持有數量的映射結構
    // Mapping owner address to token count
    mapping(address => uint256) private _balances;

    // 用來儲存 token ID 對 被授權者位址的映射結構
    // Mapping from token ID to approved address
    mapping(uint256 => address) private _tokenApprovals;

    // 用來儲存 持有者 對 第三方授權 的映射結構
    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // 建構子，初始化 ERC721 的名稱與簡稱
    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    // 告訴使用者，本合約支援： IERC721, IERC721Metadata 與 IERC165
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    // 回傳持有者持有數量
    /**
     * @dev See {IERC721-balanceOf}.
     */
    function balanceOf(address owner) public view virtual override returns (uint256) {
        // address 0 不能是持有者
        require(owner != address(0), "ERC721: balance query for the zero address");
        return _balances[owner];
    }
    
    // 回傳該 token ID 的持有者
    /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        // 取出持有者資訊
        address owner = _owners[tokenId];
        // 檢查持有者必不能是 address 0
        require(owner != address(0), "ERC721: owner query for nonexistent token");
        return owner;
    }

    // 回傳名稱
    /**
     * @dev See {IERC721Metadata-name}.
     */
    function name() public view virtual override returns (string memory) {
        return _name;
    }

    // 回傳簡稱
    /**
     * @dev See {IERC721Metadata-symbol}.
     */
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    // 回傳該 token ID 的 URI 資訊
    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        // URI 只對還存在的 token ID 有意義
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        // 取得基礎 URI (ipfs:// or http://example...)
        string memory baseURI = _baseURI();
        // 組合成完整的 URI，通常是基礎 URI + tokenID 為該 token 的完整 URI 資訊
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString())) : "";
    }

    // 回傳基礎 URI
    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overriden in child contracts.
     */
    function _baseURI() internal view virtual returns (string memory) {
        // 預設為無
        return "";
    }

    // 授權函式
    /**
     * @dev See {IERC721-approve}.
     */
    function approve(address to, uint256 tokenId) public virtual override {
        // 取得持有者資訊
        address owner = ERC721.ownerOf(tokenId);
        // 持有者不能授權給自己
        require(to != owner, "ERC721: approval to current owner");

        // 呼叫者必須是：
        // 1. 持有者本人
        // 2. 擁有持有者授權的第三方位址
        require(
            _msgSender() == owner || isApprovedForAll(owner, _msgSender()),
            "ERC721: approve caller is not owner nor approved for all"
        );

        // 呼叫內部函式進行授權
        _approve(to, tokenId);
    }

    // 回傳該 token ID 的被授權者
    /**
     * @dev See {IERC721-getApproved}.
     */
    function getApproved(uint256 tokenId) public view virtual override returns (address) {
        // 只有存在的 token ID 才能有被授權者
        require(_exists(tokenId), "ERC721: approved query for nonexistent token");

        return _tokenApprovals[tokenId];
    }

    // 授權/撤銷名下全部的 NFT 給第三方位址
    /**
     * @dev See {IERC721-setApprovalForAll}.
     */
    function setApprovalForAll(address operator, bool approved) public virtual override {
        // 持有者不能授權給自己
        require(operator != _msgSender(), "ERC721: approve to caller");

        // 設定授權/撤銷
        _operatorApprovals[_msgSender()][operator] = approved;
        // 觸發授權事件
        emit ApprovalForAll(_msgSender(), operator, approved);
    }

    // 回傳持有者是否授權給特定第三方位址
    /**
     * @dev See {IERC721-isApprovedForAll}.
     */
    function isApprovedForAll(address owner, address operator) public view virtual override returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    // 轉移函式
    /**
     * @dev See {IERC721-transferFrom}.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        // 檢查呼叫者是否有權轉移此代幣
        //solhint-disable-next-line max-line-length
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
        // 呼叫內部轉移函式
        _transfer(from, to, tokenId);
    }

    // 安全轉移函式
    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        // 直接呼叫帶有 data 欄位的版本
        safeTransferFrom(from, to, tokenId, "");
    }

    // 安全轉移函式
    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public virtual override {
        // 檢查呼叫者是否有權進行轉移
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
        // 呼叫內部安全轉移函式
        _safeTransfer(from, to, tokenId, _data);
    }

    // 內部的安全轉移函式
    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
     * are aware of the ERC721 protocol to prevent tokens from being forever locked.
     *
     * `_data` is additional data, it has no specified format and it is sent in call to `to`.
     *
     * This internal function is equivalent to {safeTransferFrom}, and can be used to e.g.
     * implement alternative mechanisms to perform token transfer, such as signature-based.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function _safeTransfer(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) internal virtual {
        // 呼叫內部轉移函式
        _transfer(from, to, tokenId);
        // 檢查接收者是否為合約，以及是否正確實作 IERC721Receiver
        require(_checkOnERC721Received(from, to, tokenId, _data), "ERC721: transfer to non ERC721Receiver implementer");
    }

    // 內部函式，檢查 token ID 是否存在
    /**
     * @dev Returns whether `tokenId` exists.
     *
     * Tokens can be managed by their owner or approved accounts via {approve} or {setApprovalForAll}.
     *
     * Tokens start existing when they are minted (`_mint`),
     * and stop existing when they are burned (`_burn`).
     */
    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        // 只有當持有者非 address 0 時才算存在。若持有者為 address 0 ，則不是已經被銷毀，就是還沒被鑄造
        return _owners[tokenId] != address(0);
    }

    // 內部函式，回傳被查詢者是否擁有對 token ID 代幣的管理權：
    // 1. 被查詢者為持有者本人 => true
    // 2. 被查詢者擁有持有者的授權
    /**
     * @dev Returns whether `spender` is allowed to manage `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool) {
        // 只有存在的 token ID 才有檢查的必要
        require(_exists(tokenId), "ERC721: operator query for nonexistent token");
        // 取出持有者資訊
        address owner = ERC721.ownerOf(tokenId);
        // 當以下其中一個條件滿足時，則代表擁有管理權：
        // 1. 持有者本人
        // 2. 擁有對該 token ID 的管理權
        // 3. 擁有對該持有者名下全部 token 的管理權
        return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
    }

    // 內部函式，安全地鑄造代幣
    /**
     * @dev Safely mints `tokenId` and transfers it to `to`.
     *
     * Requirements:
     *
     * - `tokenId` must not exist.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function _safeMint(address to, uint256 tokenId) internal virtual {
        // 呼叫帶有 data 欄位的版本
        _safeMint(to, tokenId, "");
    }

    // 內部函式，安全鑄造函式
    /**
     * @dev Same as {xref-ERC721-_safeMint-address-uint256-}[`_safeMint`], with an additional `data` parameter which is
     * forwarded in {IERC721Receiver-onERC721Received} to contract recipients.
     */
    function _safeMint(
        address to,
        uint256 tokenId,
        bytes memory _data
    ) internal virtual {
        // 呼叫內部鑄造函式
        _mint(to, tokenId);
        // 檢查接收方若為合約，則必須實作 IERC721Received 介面
        require(
            _checkOnERC721Received(address(0), to, tokenId, _data),
            "ERC721: transfer to non ERC721Receiver implementer"
        );
    }

    // 內部函式，鑄造代幣
    // 鑄造其實就是無中生有，將一個代幣從 address 0 轉移出來
    /**
     * @dev Mints `tokenId` and transfers it to `to`.
     *
     * WARNING: Usage of this method is discouraged, use {_safeMint} whenever possible
     *
     * Requirements:
     *
     * - `tokenId` must not exist.
     * - `to` cannot be the zero address.
     *
     * Emits a {Transfer} event.
     */
    function _mint(address to, uint256 tokenId) internal virtual {
        // 接收者不能為 address 0 (等同銷毀)
        require(to != address(0), "ERC721: mint to the zero address");
        // 被鑄造的代幣不能重複
        require(!_exists(tokenId), "ERC721: token already minted");

        // 呼叫轉移前的 hook
        _beforeTokenTransfer(address(0), to, tokenId);

        // 增加接收者的持有數量
        _balances[to] += 1;
        // 設定該 token 的持有者
        _owners[tokenId] = to;

        // 觸發轉移事件
        emit Transfer(address(0), to, tokenId);
    }

    // 內部函式，銷毀代幣
    /**
     * @dev Destroys `tokenId`.
     * The approval is cleared when the token is burned.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     *
     * Emits a {Transfer} event.
     */
    function _burn(uint256 tokenId) internal virtual {
        // 取得持有者資訊
        address owner = ERC721.ownerOf(tokenId);

        // 執行轉移前的 hook
        _beforeTokenTransfer(owner, address(0), tokenId);

        // 清空授權
        // Clear approvals
        _approve(address(0), tokenId);

        // 減少持有者的持有數量
        _balances[owner] -= 1;
        // 清空該代幣的持有者資訊
        delete _owners[tokenId];

        // 觸發轉移事件
        emit Transfer(owner, address(0), tokenId);
    }

    // 內部函式，用來進行轉移
    /**
     * @dev Transfers `tokenId` from `from` to `to`.
     *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     *
     * Emits a {Transfer} event.
     */
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {
        // 檢查 from 為 tokenId 的持有者
        require(ERC721.ownerOf(tokenId) == from, "ERC721: transfer of token that is not own");
        // 檢查 to 不可為 address 0
        require(to != address(0), "ERC721: transfer to the zero address");

        // 執行轉移前的 hook
        _beforeTokenTransfer(from, to, tokenId);

        // 將 tokenId 的授權者設定為 address 0 (清空授權)
        // Clear approvals from the previous owner
        _approve(address(0), tokenId);

        // 減少原持有者的持有數量
        _balances[from] -= 1;
        // 增加接收者的持有數量
        _balances[to] += 1;
        // 將接收者設定為新的持有者
        _owners[tokenId] = to;

        // 觸發轉移事件
        emit Transfer(from, to, tokenId);
    }

    // 內部函式，用來進行授權
    /**
     * @dev Approve `to` to operate on `tokenId`
     *
     * Emits a {Approval} event.
     */
    function _approve(address to, uint256 tokenId) internal virtual {
        // 將 tokenId 授權給 to
        _tokenApprovals[tokenId] = to;
        // 觸發授權事件
        emit Approval(ERC721.ownerOf(tokenId), to, tokenId);
    }

    // 內部函式，專門用來檢查接收方是否為合約，若是，則需要正確實作 IERC721Receiver.onERC721Received，否則就觸發錯誤或回傳 false
    /**
     * @dev Internal function to invoke {IERC721Receiver-onERC721Received} on a target address.
     * The call is not executed if the target address is not a contract.
     *
     * @param from address representing the previous owner of the given token ID
     * @param to target address that will receive the tokens
     * @param tokenId uint256 ID of the token to be transferred
     * @param _data bytes optional data to send along with the call
     * @return bool whether the call correctly returned the expected magic value
     */
    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) private returns (bool) {
        // 檢查接收者是否為合約
        if (to.isContract()) {
            // 嘗試呼叫 IERC721Receiver 的介面，以檢查實作是否正確
            try IERC721Receiver(to).onERC721Received(_msgSender(), from, tokenId, _data) returns (bytes4 retval) {
                return retval == IERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                // 若發生錯誤，則顯示出錯誤的理由
                if (reason.length == 0) {
                    revert("ERC721: transfer to non ERC721Receiver implementer");
                } else {
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }

    // 在轉移任何代幣之前的 hook，也就是會先執行它，再進行代幣轉移。
    /**
     * @dev Hook that is called before any token transfer. This includes minting
     * and burning.
     *
     * Calling conditions:
     *
     * - When `from` and `to` are both non-zero, ``from``'s `tokenId` will be
     * transferred to `to`.
     * - When `from` is zero, `tokenId` will be minted for `to`.
     * - When `to` is zero, ``from``'s `tokenId` will be burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {}
}
```

### `ERC721Enumerable.sol`

這個是對 ERC721 的擴充介面。

```solidity
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../ERC721.sol";
import "./IERC721Enumerable.sol";

/**
 * @dev This implements an optional extension of {ERC721} defined in the EIP that adds
 * enumerability of all the token ids in the contract as well as all token ids owned by each
 * account.
 */
abstract contract ERC721Enumerable is ERC721, IERC721Enumerable {
    // 儲存持有者 對 其名下代幣列表 的映射結構
    // Mapping from owner to list of owned token IDs
    mapping(address => mapping(uint256 => uint256)) private _ownedTokens;

    // 儲存 token ID 對 其在持有者名下序號 的映射結構
    // Mapping from token ID to index of the owner tokens list
    mapping(uint256 => uint256) private _ownedTokensIndex;

    // 儲存所有 token id 的陣列，用來列舉全部代幣所用
    // Array with all token ids, used for enumeration
    uint256[] private _allTokens;

    // 儲存 token id 到 其在 `_allTokens` 陣列中的位置
    // Mapping from token id to position in the allTokens array
    mapping(uint256 => uint256) private _allTokensIndex;

    // 檢查支援的介面
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(IERC165, ERC721) returns (bool) {
        // 支援 IERC721Enumerable 或被此合約繼承的介面
        return interfaceId == type(IERC721Enumerable).interfaceId || super.supportsInterface(interfaceId);
    }

    // 利用持有者資訊與該代幣在持有者列表中的序號，來反查代幣編號
    /**
     * @dev See {IERC721Enumerable-tokenOfOwnerByIndex}.
     */
    function tokenOfOwnerByIndex(address owner, uint256 index) public view virtual override returns (uint256) {
        // 序號必定小於持有者的持有總數
        require(index < ERC721.balanceOf(owner), "ERC721Enumerable: owner index out of bounds");
        return _ownedTokens[owner][index];
    }

    // 回傳目前鑄造出的代幣總量
    /**
     * @dev See {IERC721Enumerable-totalSupply}.
     */
    function totalSupply() public view virtual override returns (uint256) {
        return _allTokens.length;
    }

    // 回傳在所有代幣中，序號為 index 的代幣編號 
    /**
     * @dev See {IERC721Enumerable-tokenByIndex}.
     */
    function tokenByIndex(uint256 index) public view virtual override returns (uint256) {
        // 查詢的序號必須低於鑄造出的代幣總量
        require(index < ERC721Enumerable.totalSupply(), "ERC721Enumerable: global index out of bounds");
        return _allTokens[index];
    }

    // 在轉移前的 hook
    /**
     * @dev Hook that is called before any token transfer. This includes minting
     * and burning.
     *
     * Calling conditions:
     *
     * - When `from` and `to` are both non-zero, ``from``'s `tokenId` will be
     * transferred to `to`.
     * - When `from` is zero, `tokenId` will be minted for `to`.
     * - When `to` is zero, ``from``'s `tokenId` will be burned.
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);

        
        if (from == address(0) /* 若為鑄造所觸發的轉移 */) {
            // 將新代幣加入總代幣列表
            _addTokenToAllTokensEnumeration(tokenId);
        } else if (from != to /* 原持有者轉移代幣 */) {
            // 將代幣從原持有者列表中移除
            _removeTokenFromOwnerEnumeration(from, tokenId);
        }
        if (to == address(0) /* 若為銷毀所觸發的轉移 */) {
           // 將代幣從總代幣列表中移除
            _removeTokenFromAllTokensEnumeration(tokenId);
        } else if (to != from /* 新持有者接收代幣 */) {
            // 將代幣加入新持有者列表中
            _addTokenToOwnerEnumeration(to, tokenId);
        }
    }

    // 內部函式，用來將代幣加入新持有者列表中
    /**
     * @dev Private function to add a token to this extension's ownership-tracking data structures.
     * @param to address representing the new owner of the given token ID
     * @param tokenId uint256 ID of the token to be added to the tokens list of the given address
     */
    function _addTokenToOwnerEnumeration(address to, uint256 tokenId) private {
        // 取得新持有者的持有總數
        uint256 length = ERC721.balanceOf(to);
        // 將新代幣加入持有列表的尾端
        _ownedTokens[to][length] = tokenId;
        // 將新代幣的序號設定為持有列表的當前長度
        _ownedTokensIndex[tokenId] = length;
    }

    // 內部函式，用來將新代幣加入總代幣列表中
    /**
     * @dev Private function to add a token to this extension's token tracking data structures.
     * @param tokenId uint256 ID of the token to be added to the tokens list
     */
    function _addTokenToAllTokensEnumeration(uint256 tokenId) private {
        // 更新序號
        _allTokensIndex[tokenId] = _allTokens.length;
        // 加入總代幣列表
        _allTokens.push(tokenId);
    }

    // 內部函式，從原持有者列表中移除代幣
    /**
     * @dev Private function to remove a token from this extension's ownership-tracking data structures. Note that
     * while the token is not assigned a new owner, the `_ownedTokensIndex` mapping is _not_ updated: this allows for
     * gas optimizations e.g. when performing a transfer operation (avoiding double writes).
     * This has O(1) time complexity, but alters the order of the _ownedTokens array.
     * @param from address representing the previous owner of the given token ID
     * @param tokenId uint256 ID of the token to be removed from the tokens list of the given address
     */
    function _removeTokenFromOwnerEnumeration(address from, uint256 tokenId) private {
        // 為了避免在持有者列表中產生空位，總會利用交換的方式，把想移除的代幣換到最後一個代幣的欄位，再行移除
        // To prevent a gap in from's tokens array, we store the last token in the index of the token to delete, and
        // then delete the last slot (swap and pop).

        // 取得最後代幣的序號
        uint256 lastTokenIndex = ERC721.balanceOf(from) - 1;
        // 取得目標代幣的序號
        uint256 tokenIndex = _ownedTokensIndex[tokenId];

        // 只有最後代幣與目標代幣的序號不同時，需要進行交換
        // When the token to delete is the last token, the swap operation is unnecessary
        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _ownedTokens[from][lastTokenIndex];

            _ownedTokens[from][tokenIndex] = lastTokenId; // Move the last token to the slot of the to-delete token
            _ownedTokensIndex[lastTokenId] = tokenIndex; // Update the moved token's index
        }

        // 刪除最後代幣的持有者資訊
        // This also deletes the contents at the last position of the array
        delete _ownedTokensIndex[tokenId];
        delete _ownedTokens[from][lastTokenIndex];
    }

    // 內部函式，將代幣從總代幣列表中移除
    /**
     * @dev Private function to remove a token from this extension's token tracking data structures.
     * This has O(1) time complexity, but alters the order of the _allTokens array.
     * @param tokenId uint256 ID of the token to be removed from the tokens list
     */
    function _removeTokenFromAllTokensEnumeration(uint256 tokenId) private {
        // 為了避免總代幣列表中產生空位，因此會採用交換目標代幣列表的最尾端，再行刪除。
        // To prevent a gap in the tokens array, we store the last token in the index of the token to delete, and
        // then delete the last slot (swap and pop).

        uint256 lastTokenIndex = _allTokens.length - 1;
        uint256 tokenIndex = _allTokensIndex[tokenId];

        // When the token to delete is the last token, the swap operation is unnecessary. However, since this occurs so
        // rarely (when the last minted token is burnt) that we still do the swap here to avoid the gas cost of adding
        // an 'if' statement (like in _removeTokenFromOwnerEnumeration)
        uint256 lastTokenId = _allTokens[lastTokenIndex];

        _allTokens[tokenIndex] = lastTokenId; // Move the last token to the slot of the to-delete token
        _allTokensIndex[lastTokenId] = tokenIndex; // Update the moved token's index

        // This also deletes the contents at the last position of the array
        delete _allTokensIndex[tokenId];
        _allTokens.pop();
    }
}
```
