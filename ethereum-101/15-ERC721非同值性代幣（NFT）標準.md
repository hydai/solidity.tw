# ERC721 非同值性代幣（NFT）標準

與 ERC20 同值性代幣不同，ERC721 的代幣不允許同值性存在，因此每個代幣都擁有一個獨一無二的編號（uint256 型態），且這組編號在合約建立到銷毀前都不應該被改變。

除了本質與 ERC20 不同之外，NFT 的可能使用場景可能更加複雜，比如 NFT 可以被放到一個公開交易市場上（如：[OpenSea](https://opensea.io/)）或其他第三方服務所持有或轉移。

此外，NFT 的常見使用情境有：

1. 「對實體資產的擁有權」：將房屋權狀綁定成 NFT、把畫作綁定成 NFT 等。
2. 「收藏品」：手機遊戲中常見的收集要素，比如抽角色、抽武器裝備、抽卡包等。
3. 「虛擬資產」：在去中心化交易所成為流動性提供者可獲得對應的交易對的 NFT、買了 ENS 網域名稱也會獲得一個 NFT 代表該網域的所有權。

```solidity
interface ERC721 {
    /// 轉移事件：當 NFT 的所有權被轉移時，觸發此事件，包含「產生（`from == 0`）」與「銷毀（to == 0）」的轉移。
    /// 發送者：`_from`
    /// 接收者：`_to`
    /// 轉移的 NFT ID：`tokenId``
    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);

    /// 授權事件：當有人授權 NFT 給他人時，觸發此事件。
    /// 當轉移發生時，需要將被轉移的 NFT 中已經授權的位址清空。
    /// 持有者：`_owner`
    /// 被授權者：`_approved`
    /// 授權的 NFT ID：`tokenId``
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);

    /// 授權或撤銷事件：持有者授權或撤銷給被授權者其全部持有的 NFT 時，觸發此事件。
    /// 持有者：`_owner`
    /// 被授權者：`_operator`
    /// 授權或撤銷：`_approved`
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

    /// 回傳該持有者(`_owner`)所持有的 NFT 數量（`uint256`）。
    function balanceOf(address _owner) external view returns (uint256);

    /// 回傳該 NFT(`_tokenId`) 的持有者（`address`）。
    function ownerOf(uint256 _tokenId) external view returns (address);

    /// 從當前持有者（`_from`）轉移 NFT (`_tokenId`) 的持有權給新持有者（`_to`），並把附加資料（`data`）一起發給新持有者。
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data) external payable;

    /// 從當前持有者（`_from`）轉移 NFT (`_tokenId`) 的持有權給新持有者（`_to`）。
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable;

    /// 從當前持有者（`_from`）轉移 NFT (`_tokenId`) 的持有權給新持有者（`_to`），但不檢查是否新持有者是否能接收這個 NFT。
    function transferFrom(address _from, address _to, uint256 _tokenId) external payable;

    /// 發送者（`msg.sender`）授權 NFT （`_tokenId`）給第三方（`_approved`）。
    function approve(address _approved, uint256 _tokenId) external payable;

    /// 發送者（`msg.sender`）授權或撤銷所有 NFT 給第三方（`_operator`）。
    function setApprovalForAll(address _operator, bool _approved) external;

    /// 檢查 NFT（`_tokenId`）的被授權者帳戶（`address`），若無被授權者，回傳 0x0。
    function getApproved(uint256 _tokenId) external view returns (address);

    /// 檢查持有者（`_owner`）是否授權全部的 NFT 給第三方帳戶（`_operator`）。
    function isApprovedForAll(address _owner, address _operator) external view returns (bool);
}
```
