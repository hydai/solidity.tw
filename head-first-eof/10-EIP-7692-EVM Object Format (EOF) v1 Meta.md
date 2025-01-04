# EIP-7692: EVM Object Format (EOF) v1 Meta

## 摘要
本 EIP 屬於一個元（Meta） EIP，目標是列出在 EOF v1 版本（又稱之為`超級 EOF`, `Mega EOF`）中所涉及到的其他 EIPs 。

## 相依性

本 EIP 依賴於以下特定幾個 EIPs
- 663
- 3540
- 3670
- 4200
- 4750
- 5450
- 6206
- 7069
- 7480
- 7620
- 7698

由於後續我們會對這些 EIP 進行細節的討論，因此在此只是先列出，有興趣的同學可以直接進入對應的章節瞭解更多資訊。

## 規格

### 在 EOFv1 中必須實作以下幾個 EIPs

- EIP-3540: EOF - EVM Object Format v1
- EIP-3670: EOF - Code Validation
- EIP-4200: EOF - Static relative jumps
- EIP-4750: EOF - Functions
- EIP-5450: EOF - Stack Validation
- EIP-6206: EOF - JUMPF and non-returning functions
- EIP-7480: EOF - Data section access instructions
- EIP-663: SWAPN, DUPN and EXCHANGE instructions
- EIP-7069: Revamped CALL instructions
- EIP-7620: EOF Contract Creation
- EIP-7698: EOF - Creation transaction

## 參考資料
- [EIP-7692](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-7692.md)