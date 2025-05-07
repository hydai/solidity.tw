# 實例解析 - Proof of Stake 書籍的捐款合約 Part 3

## 合約原始碼

[合約原始碼請點此](https://etherscan.io/address/0x5bf5bcc5362f88721167c1068b58c60cad075aac#code)

### `ProofOfStake_Pages.sol` 引用的函式庫與介面

ProofOfStake_Pages 合約中引入的函式庫與介面，可以看到以下的結構(`*` 為本日說明的範圍)

```solidity
ProofOfStake_Pages
|- Ownable.sol*
|  |- (Part 2) Context.sol
|- ReentrancyGuard.sol*
|- ERC721Enumerable.sol
|  |- ERC721.sol
|  |  |- IERC721.sol
|  |     |- IERC165.sol
|  |  |- IERC721Receiver.sol
|  |  |- IERC721Metadata.sol
|  |  |- Address.sol
|  |  |- (Part 2) Context.sol
|  |  |- (Part 2) Strings.sol
|  |  |- ERC165.sol
|  |- IERC721Enumerable.sol
|  |  |- IERC721.sol
|  |     |- IERC165.sol
|- (Part 2) Strings.sol
|- (Part 2) Counters.sol
|- (Part 1) base64.sol
|- (Part 1)Transforms.sol
```

### `Ownable.sol`

`Ownable` 是一個輔助合約，讓繼承的合約可以擁有對合約的存取管理權限，它提供了以下功能：

1. 合約建立時在 `constructor` 階段，將 owner 設定成 `msg.sender`。
2. 提供了 `OwnershipTransferred` 的事件，當合約的擁有者轉移時觸發。
3. 提供 `owner` 函式用來查詢當前的擁有者。
4. 提供 `onlyOwner` 的修飾子，方便套用在函式上，用來限制只允許擁有者存取的函式。
5. 提供 `renounceOwnership` 函式，將擁有者設定為位址 `0` ，其涵義為讓這個合約永久變成無擁有者狀態。
6. 提供 `transferOwnership` 函式，用來轉移擁有者。

值得一提的是，為了較佳的可讀性，與避免重複的程式碼出現，我們可以發現所有設定 `owner` 的操作都是透過呼叫一個特別的內部函式 `_setOwner`。

```solidity
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../utils/Context.sol";

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _setOwner(_msgSender());
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _setOwner(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _setOwner(newOwner);
    }

    function _setOwner(address newOwner) private {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}
```

### `ReentrancyGuard.sol`

`ReentrancyGuard` 是一個輔助合約，用來規避重入攻擊（reentrant attack）。

1. 合約提供一個修飾子 `nonReentrant` 用來避免同一個函式被直接或間接地重複呼叫，以規避重入攻擊。

推薦一部[影片](https://www.youtube.com/watch?v=76So4jCysAQ)，裡頭舉例了一個重入攻擊怎麼發生，以及如何避免。

值得注意的是，該合約在註解中提到：「使用 boolean 會比 uint256 還昂貴」，理由是因為以太坊虛擬機中的每個記憶體單元的長度跟 uint256 一樣大，然而使用 boolean 來儲存狀態的話，會因為他需要「讀出 uint256 的長度，然後只修改最尾端的位元」，因此會使對 boolean 的操作更貴。

```solidity
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and make it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        // On the first call to nonReentrant, _notEntered will be true
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;

        _;

        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }
}
```
