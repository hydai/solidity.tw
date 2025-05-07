# 深入淺出 EOFv1

為一系列以 EVM Object Format 為主題的教學課程，包含影片與文章，為「淺入淺出 EOF」的重製版本。將以完全初學者的角度入手，從各種背景知識開始介紹，由淺入深的讓讀者對 EOF 能有更完整的印象。

* [影片播放清單(現正熱映中)](https://www.youtube.com/playlist?list=PLHmOMPRfmOxQo8mIUkW2DNj9l4Y3MW9KW)。
* [影片講義](/head-first-eof-lecture-notes)：為影片的講義。

本系列文章正在生產中，預計於 2025 Q1 結尾釋出。

## 前言

目前已經更新的「淺入淺出 EOF」與「深入淺出 EOF」影片系列是我對目前 EOFv1 的基礎介紹，而之前被敲碗更多的是希望能以文章的方式，來闡述我對 EOF 的理解，與內容的頗析。因此我將重新以文字的方式來呈現這些內容，希望用更有結構化的方式，幫助讀者理解這些內容。

## 關於 EOF

EVM Object format 的第一個版本其實積累了多年來許多針對以太坊虛擬機(EVM)的改善與增強，由於近年來以太坊的發展重心並不在 EVM 本身，更多的是在共識機制、隱私保護、可擴展性等議題，如：PoS、zk-SNARKs、sharding 等等，因此 EVM Object Format 的相關提案雖然已經發展很長的時間了，但一直都沒能進到硬分叉的階段。

等待這麼久的 EOFv1 終於不再是三環三線夢裡相見，終於在近期的 Pectra 升級裡被加入到以太坊主網中，這對於智慧合約開發的發展來說毫無疑問地是個重要的里程碑，不只會改變現在的智慧合約的底層架構，提供一套更全面的基礎建設，使得靜態分析等相關工具許多工具得以升級。

過往都是巧婦難為無米之炊，好的開發者與工具鏈的維護者受限於以前 EVM 不夠好且限制很多，做事情綁手綁腳的，無法大展身手，如今有了 EOF 的出現將為以太坊的智慧合約開發帶來更多的可能性。

## 大綱

請注意，由於 EOFv1 暫時被移出硬分岔之中，因此本系列只有部分文章完成，剩餘的部分將留滯到 EOFv1 正式上線後再進行更新。

這次的系列將會分為以下幾個章節（暫定，將於系列完成後更新）：

1. 以太坊虛擬機簡介
    1. 什麼是以太坊虛擬機 (Ethereum Virtual Machine, EVM)
    1. 什麼是以太坊虛擬機組合語言 (Ethereum Virtual Machine Assembly Language, EVM Assembly Language)
    1. 什麼是以太坊虛擬機位元組碼 (Ethereum Virtual Machine Bytecode, EVM Bytecode)
1. 智慧合約簡介
    1. 什麼是智慧合約 (Smart Contract)
    1. 如何撰寫一份智慧合約，以 Solidity 為例
    1. 如何將智慧合約編譯成以太坊虛擬機位元組碼
    1. 如何將智慧合約部署到以太坊主網 (Mainnet)
    1. 如何與智慧合約互動
1. 什麼是以太坊物件格式 (EVM Object Format, EOF)
    1. EIP-7692: EVM Object Format (EOF) v1 Meta
    1. EIP-3541: Reject new contract code starting with the 0xEF byte
    1. EIP-3540: EOFv1
    1. EIP-3670: EOF - Code Validation - Validate EOF bytecode for correctness at the time of deployment
    1. EIP-4200: EOF - Static relative jumps - RJUMP, RJUMPI and RJUMPV instructions with a signed immediate encoding the jump destination
    1. EIP-7480: EOF - Data section access instructions
    1. EIP-663: SWAPN, DUPN and EXCHANGE instructions
    1. EIP-7069: Revamped CALL instructions - Introduce EXTCALL, EXTDELEGATECALL and EXTSTATICCALL with simplified semantics
    1. EIP-4750: EOF - Functions - Individual sections for functions with `CALLF` and `RETF` instructions
    1. EIP-6206: EOF - JUMPF and non-returning functions - Introduces instruction for chaining function calls
    1. EIP-7620: EOF Contract Creation - Introduce `EOFCREATE` and `RETURNCONTRACT` instructions
    1. EIP-7698: EOF - Creation transaction - Deploy EOF contracts using creation transactions
    1. EIP-5450: EOF - Stack Validation - Deploy-time validation of stack usage for EOF functions
1. 總結
