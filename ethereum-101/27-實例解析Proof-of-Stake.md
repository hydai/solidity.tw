# 實例解析 - Proof of Stake 書籍的捐款合約 Part 5

## 合約原始碼

[合約原始碼請點此](https://etherscan.io/address/0x5bf5bcc5362f88721167c1068b58c60cad075aac#code)

### `ProofOfStake_Pages.sol` 引用的函式庫與介面

ProofOfStake_Pages 合約中引入的函式庫與介面，可以看到以下的結構(`*` 為本日說明的範圍)

```solidity
ProofOfStake_Pages
|- (Part 3) Ownable.sol
|  |- (Part 2) Context.sol
|- (Part 3) ReentrancyGuard.sol
|- ERC721Enumerable.sol
|  |- ERC721.sol
|  |  |- (前文) IERC721.sol*
|  |     |- IERC165.sol*
|  |  |- IERC721Receiver.sol*
|  |  |- (前文) IERC721Metadata.sol*
|  |  |- (Part 4) Address.sol
|  |  |- (Part 2) Context.sol
|  |  |- (Part 2) Strings.sol
|  |  |- ERC165.sol*
|  |- (前文) IERC721Enumerable.sol*
|  |  |- (前文) IERC721.sol*
|  |     |- IERC165.sol*
|- (Part 2) Strings.sol
|- (Part 2) Counters.sol
|- (Part 1) base64.sol
|- (Part 1)Transforms.sol
```

### `IERC721.sol`

請參考[前文「ERC721 非同值性代幣（NFT）標準」](https://ithelp.ithome.com.tw/articles/10301718)。

### `IERC721Enumerable.sol`

請參考[前文「ERC721 的列舉擴充（enumeration extension）」](https://ithelp.ithome.com.tw/articles/10303007)

### `IERC721Metadata.sol`

請參考[前文「ERC721 的元資料擴充（metadata extension）」](https://ithelp.ithome.com.tw/articles/10302264)

### `IERC721Receiver.sol`

`IERC721Receiver` 是一個 ERC721 的附屬介面，用來檢查該合約是否支援 ERC721 標準中的「`safeTransfers`」的操作。

當 `safeTransfers` 被呼叫時，在轉移後必定會呼叫這個介面中的函式「`onERC721Received`」，而欲支援 ERC721 的安全轉移的合約必須實作這個函式且回傳該函式的 `Solidity selector`（透過 `IERC721.onERC721Received.selector` 取得）。其他任何與此數值不同的回傳值，將觸發 `revert`。

```solidity
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @title ERC721 token receiver interface
 * @dev Interface for any contract that wants to support safeTransfers
 * from ERC721 asset contracts.
 */
interface IERC721Receiver {
    /**
     * @dev Whenever an {IERC721} `tokenId` token is transferred to this contract via {IERC721-safeTransferFrom}
     * by `operator` from `from`, this function is called.
     *
     * It must return its Solidity selector to confirm the token transfer.
     * If any other value is returned or the interface is not implemented by the recipient, the transfer will be reverted.
     *
     * The selector can be obtained in Solidity with `IERC721.onERC721Received.selector`.
     */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}
```

### `IERC165.sol`

[EIP-165](https://eips.ethereum.org/EIPS/eip-165) 用來偵測該合約實作了哪些標準介面。

由於合約的標準很多元，因此一個合約中可能支援不只一種標準，為了能精準地得知該合約有哪些可能的操作介面，因此 ERC165 是非常重要的標準，用來讓其他人知道怎麼正確地與合約進行互動。

實作此標準的開發者應正確地使用 `supportsInterface`，應在裡面判斷 `interfaceId` 是否與 `type(Interface).interfaceId` 一致。

```solidity
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[EIP].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}
```
