# 實例解析 - Proof of Stake 書籍的捐款合約 Part 1

## 關於此書

![](https://i.imgur.com/pzgrA8F.jpg)

以太坊聯合創始人 Vitalik Buterin 在 2022/8/31 宣佈他將發布一本新書「Proof of Stake」，將包含實體版（可以從各大通路買到）與數位版（一本 PDF）。書中總結了他過去十年來的各種寫作精華。

如果透過 gitcoin 的數位通路進行捐款，將可以獲得數位簽名版加上一個 NFT 作為回饋。

該募資網站： https://proofofstake.gitcoin.co

## 捐款後的 NFT

![](https://i.imgur.com/bxqLltK.png)

如上圖，在捐款後所獲得的 NFT 會紀錄什麼時候鑄造的、捐款多少、與合約地址。

## 解析合約

既然有了合約地址，因此接下來的幾日，我們將依序拆解這個合約，來講講捐款、鑄造等合約的內容。
請注意，如果是輔助函式，在本系列中不會特別花力氣講解每一行的邏輯，只會提及該合約被引入的主要目的。

[合約原始碼請點此](https://etherscan.io/address/0x5bf5bcc5362f88721167c1068b58c60cad075aac#code)

### 核心合約 `ProofOfStake_Pages.sol`

我們直接展開 ProofOfStake_Pages 合約中引入的函式庫與介面，可以看到以下的結構(`*` 為本日說明的範圍)

```solidity
ProofOfStake_Pages
|- Ownable.sol
|  |- Context.sol
|- ReentrancyGuard.sol
|- ERC721Enumerable.sol
|  |- ERC721.sol
|  |  |- IERC721.sol
|  |     |- IERC165.sol
|  |  |- IERC721Receiver.sol
|  |  |- IERC721Metadata.sol
|  |  |- Address.sol
|  |  |- Context.sol
|  |  |- Strings.sol
|  |  |- ERC165.sol
|  |- IERC721Enumerable.sol
|  |  |- IERC721.sol
|  |     |- IERC165.sol
|- Strings.sol
|- Counters.sol
|- base64.sol*
|- Transforms.sol*
```

### `Transforms.sol`

`Transforms` 是一個輔助合約，他提供以下幾個功能：
1. 將簽名（signature）還原出構成的 `v`, `r`, `s` 三個部分。
2. 把位址（address）轉成字串（string）
3. 將一個位元組（bytes1）轉成字元（依然是 bytes1，但轉成可視範圍）
```solidity
pragma solidity >=0.8.0 <0.9.0;

//SPDX-License-Identifier: MIT

library Transforms {
    function splitSignature(bytes memory sig)
        internal
        pure
        returns (
            uint8 v,
            bytes32 r,
            bytes32 s
        )
    {
        require(sig.length == 65);

        assembly {
            // first 32 bytes, after the length prefix.
            r := mload(add(sig, 32))
            // second 32 bytes.
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes).
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    /*///////////////////////////////////////////////////////////////
                             TYPE LOGIC
    //////////////////////////////////////////////////////////////*/

    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint256 i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint256(uint160(x)) / (2**(8 * (19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2 * i] = char(hi);
            s[2 * i + 1] = char(lo);
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
}
```

### `base64.sol`

關於 base64 格式的細節，請[參考維基百科](https://zh.wikipedia.org/zh-tw/Base64)

提供對 base64 格式的編碼與解碼函式：
1. `encode`：將一段資料（bytes 格式）編碼成一串 base64 格式的字串（string）
2. `decode`：將 base64 格式的字串（string）解碼成原始資料（bytes）

```solidity
// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0;

/// @title Base64
/// @author Brecht Devos - <brecht@loopring.org>
/// @notice Provides functions for encoding/decoding base64
library Base64 {
    string internal constant TABLE_ENCODE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    bytes  internal constant TABLE_DECODE = hex"0000000000000000000000000000000000000000000000000000000000000000"
                                            hex"00000000000000000000003e0000003f3435363738393a3b3c3d000000000000"
                                            hex"00000102030405060708090a0b0c0d0e0f101112131415161718190000000000"
                                            hex"001a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132330000000000";

    function encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return '';

        // load the table into memory
        string memory table = TABLE_ENCODE;

        // multiply by 4/3 rounded up
        uint256 encodedLen = 4 * ((data.length + 2) / 3);

        // add some extra buffer at the end required for the writing
        string memory result = new string(encodedLen + 32);

        assembly {
            // set the actual output length
            mstore(result, encodedLen)

            // prepare the lookup table
            let tablePtr := add(table, 1)

            // input ptr
            let dataPtr := data
            let endPtr := add(dataPtr, mload(data))

            // result ptr, jump over length
            let resultPtr := add(result, 32)

            // run over the input, 3 bytes at a time
            for {} lt(dataPtr, endPtr) {}
            {
                // read 3 bytes
                dataPtr := add(dataPtr, 3)
                let input := mload(dataPtr)

                // write 4 characters
                mstore8(resultPtr, mload(add(tablePtr, and(shr(18, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr( 6, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(        input,  0x3F))))
                resultPtr := add(resultPtr, 1)
            }

            // padding with '='
            switch mod(mload(data), 3)
            case 1 { mstore(sub(resultPtr, 2), shl(240, 0x3d3d)) }
            case 2 { mstore(sub(resultPtr, 1), shl(248, 0x3d)) }
        }

        return result;
    }

    function decode(string memory _data) internal pure returns (bytes memory) {
        bytes memory data = bytes(_data);

        if (data.length == 0) return new bytes(0);
        require(data.length % 4 == 0, "invalid base64 decoder input");

        // load the table into memory
        bytes memory table = TABLE_DECODE;

        // every 4 characters represent 3 bytes
        uint256 decodedLen = (data.length / 4) * 3;

        // add some extra buffer at the end required for the writing
        bytes memory result = new bytes(decodedLen + 32);

        assembly {
            // padding with '='
            let lastBytes := mload(add(data, mload(data)))
            if eq(and(lastBytes, 0xFF), 0x3d) {
                decodedLen := sub(decodedLen, 1)
                if eq(and(lastBytes, 0xFFFF), 0x3d3d) {
                    decodedLen := sub(decodedLen, 1)
                }
            }

            // set the actual output length
            mstore(result, decodedLen)

            // prepare the lookup table
            let tablePtr := add(table, 1)

            // input ptr
            let dataPtr := data
            let endPtr := add(dataPtr, mload(data))

            // result ptr, jump over length
            let resultPtr := add(result, 32)

            // run over the input, 4 characters at a time
            for {} lt(dataPtr, endPtr) {}
            {
               // read 4 characters
               dataPtr := add(dataPtr, 4)
               let input := mload(dataPtr)

               // write 3 bytes
               let output := add(
                   add(
                       shl(18, and(mload(add(tablePtr, and(shr(24, input), 0xFF))), 0xFF)),
                       shl(12, and(mload(add(tablePtr, and(shr(16, input), 0xFF))), 0xFF))),
                   add(
                       shl( 6, and(mload(add(tablePtr, and(shr( 8, input), 0xFF))), 0xFF)),
                               and(mload(add(tablePtr, and(        input , 0xFF))), 0xFF)
                    )
                )
                mstore(resultPtr, shl(232, output))
                resultPtr := add(resultPtr, 3)
            }
        }

        return result;
    }
}
```
