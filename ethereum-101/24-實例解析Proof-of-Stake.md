# 實例解析 - Proof of Stake 書籍的捐款合約 Part 2

## 合約原始碼

[合約原始碼請點此](https://etherscan.io/address/0x5bf5bcc5362f88721167c1068b58c60cad075aac#code)

### `ProofOfStake_Pages.sol` 引用的函式庫與介面

ProofOfStake_Pages 合約中引入的函式庫與介面，可以看到以下的結構(`*` 為本日說明的範圍)

```solidity
ProofOfStake_Pages
|- Ownable.sol
|  |- Context.sol*
|- ReentrancyGuard.sol
|- ERC721Enumerable.sol
|  |- ERC721.sol
|  |  |- IERC721.sol
|  |     |- IERC165.sol
|  |  |- IERC721Receiver.sol
|  |  |- IERC721Metadata.sol
|  |  |- Address.sol
|  |  |- Context.sol*
|  |  |- Strings.sol*
|  |  |- ERC165.sol
|  |- IERC721Enumerable.sol
|  |  |- IERC721.sol
|  |     |- IERC165.sol
|- Strings.sol*
|- Counters.sol*
|- (Part 1) base64.sol
|- (Part 1)Transforms.sol
```

### `Counters.sol`

`Counters` 是一個輔助合約，他提供了計數器的功能：

1. 提供一個資料結構 `Counter` 為一個 `uint256` 的計數器，且初始值為 `0`。
2. 當要拿到當前的數值時，呼叫 `current(Counter)` 而不應該直接讀取 `Counter._value`
3. 要增加一次計數時，呼叫 `increment(Counter)`
4. 要減少一次計數時，呼叫 `decrement(Counter)`
5. 若要重設計數器，呼叫 `reset(Counter)`

```solidity
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @title Counters
 * @author Matt Condon (@shrugs)
 * @dev Provides counters that can only be incremented, decremented or reset. This can be used e.g. to track the number
 * of elements in a mapping, issuing ERC721 ids, or counting request ids.
 *
 * Include with `using Counters for Counters.Counter;`
 */
library Counters {
    struct Counter {
        // This variable should never be directly accessed by users of the library: interactions must be restricted to
        // the library's function. As of Solidity v0.5.2, this cannot be enforced, though there is a proposal to add
        // this feature: see https://github.com/ethereum/solidity/issues/4637
        uint256 _value; // default: 0
    }

    function current(Counter storage counter) internal view returns (uint256) {
        return counter._value;
    }

    function increment(Counter storage counter) internal {
        unchecked {
            counter._value += 1;
        }
    }

    function decrement(Counter storage counter) internal {
        uint256 value = counter._value;
        require(value > 0, "Counter: decrement overflow");
        unchecked {
            counter._value = value - 1;
        }
    }

    function reset(Counter storage counter) internal {
        counter._value = 0;
    }
}
```

### `Strings.sol`

`Strings` 是一個輔助合約，他提供了字串處理的功能：

1. `toString(uint256 value)`：將一個 `uint256` 的非負整數轉換成以 `ASCII` 編碼的字串。
2. `toHexString(uint256 value)`：將一個 `uint256` 的非負整數轉換成以 `ASCII` 編碼且以十六進位表示的字串。
3. `toHexString(uint256 value, uint256 length)`：將一個 `uint256` 的非負整數轉換成以 `ASCII` 編碼且以十六進位表示的字串，並指定輸出的字串長度。

```solidity
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev String operations.
 */
library Strings {
    bytes16 private constant _HEX_SYMBOLS = "0123456789abcdef";

    /**
     * @dev Converts a `uint256` to its ASCII `string` decimal representation.
     */
    function toString(uint256 value) internal pure returns (string memory) {
        // Inspired by OraclizeAPI's implementation - MIT licence
        // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation.
     */
    function toHexString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0x00";
        }
        uint256 temp = value;
        uint256 length = 0;
        while (temp != 0) {
            length++;
            temp >>= 8;
        }
        return toHexString(value, length);
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation with fixed length.
     */
    function toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = _HEX_SYMBOLS[value & 0xf];
            value >>= 4;
        }
        require(value == 0, "Strings: hex length insufficient");
        return string(buffer);
    }
}
```

### `Context.sol`

`Context` 是一個輔助合約，他提供幾個輔助函式，用以查詢當前執行環境的語境中的發送者(`msg.sender`)與發送資料(`msg.data`)。

```solidity
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}
```
