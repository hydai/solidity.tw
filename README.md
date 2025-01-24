# 一本關於 Ethereum 與 Solidity 智慧合約的書

## 寫在最前面

本書並無預定的完成日期，是以滾動式更新為主，目前會有以下幾個系列：

1. [那些關於 Ethereum 的事](/ethereum-101)：為一系列與 Ethereum 為主的文章。
2. [在 2022 年，我們該如何寫智慧合約](https://www.youtube.com/playlist?list=PLHmOMPRfmOxQYDnXAc1hKY6ra4WDU8ZlM)：為一系列以智慧合約程式語言 Soliidty 0.8.x 為基礎的影片教學課程。
3. 在智慧合約背後，你不知道的事：為一系列相對進階的智慧合約開發技巧的文章與教學影片（目前還在規劃中，預計 2023 年六月底前發布）。
4. [淺入淺出 EVM Object Format](https://www.youtube.com/playlist?list=PLHmOMPRfmOxTiqyaSu1EXs8ioESZtOSHN)：為一系列以 EVM Object Format 為主題的影片教學課程。包含但不限於 EIP-7692 所包含的 EIPs 與 EOFv1 的優點和改進的好處。
5. 深入淺出 EVM Object Format：為一系列以 EVM Object Format 為主題的教學課程，包含影片與文章，為「淺入淺出 EOF」的重製版本。將以完全初學者的角度入手，從各種背景知識開始介紹，由淺入深的讓讀者對 EOF 能有更完整的印象。
    * [影片播放清單(現正熱映中)](https://www.youtube.com/playlist?list=PLHmOMPRfmOxQo8mIUkW2DNj9l4Y3MW9KW)。
    * [影片講義](/head-first-eof-lecture-notes)：為影片的講義。
    * [文章(正在施工中)]()：為以文章方式的脈絡來講述 EOFv1 的細節，正在施工中，預計 2025 Q1 結尾完成。
6. 那些觀眾想知道的事：為觀眾透過 GitHub Issue 向海帶我提問的主題或者問題，將會以文章的方式來呈現（目前還在寫作中，等 5 完成以後才會繼續進行）

如果你有想看的主題，或者認為哪些主題應該被涵蓋在本書中，請[使用 GitHub Issue](https://github.com/hydai/solidity.tw/issues/new/choose) 來進行發問。

## 關於這本書的由來

我曾經於 2018 年末錄製了一份 [Solidity 智慧合約的教學影片](https://youtube.com/playlist?list=PLHmOMPRfmOxSJcrlwyandWYiuP9ZAMYoF)，當時以 Solidity 版本 0.4.x 的語法進行課程的設計與規劃。然而，一個新語言的演進是非常迅速的。如今的 Solidity 已經是 0.8.x 版本，很多的語法、例子已經不再適用。

最近幾個月剛好在教身邊的朋友如何寫合約，因此決定把過往的教材拿出來翻修，並搭配現在的 Ethereum The Merge 的時機點，來聊聊關於 Ethereum 1.0, 2.0 與 Solidity 智慧合約開發的那些事。

## 獲獎資訊

謝謝 2022 年 iThome 鐵人賽評審的認可。

本作品中的「[那些關於 Ethereum 的事](https://ithelp.ithome.com.tw/users/20083367/ironman/5136)」獲得「Web 3 組佳作」；「[在 2022 年，我們該如何寫智慧合約](https://ithelp.ithome.com.tw/users/20083367/ironman/5019)」更是獲得「影片教學組優選」。

* [2022 鐵人賽得獎名單](https://ithelp.ithome.com.tw/2022ironman/reward)

謝謝 2024 年 iThome 鐵人賽評審的認可。

本作品中的「[淺入淺出 EVM Object Format](https://ithelp.ithome.com.tw/users/20083367/ironman/8062)」獲得「影片教學組佳作」。

* [2024 鐵人賽得獎名單](https://ithelp.ithome.com.tw/2024ironman/reward)

## 一些相關的連結

* [2022 鐵人賽：在 2022 年，我們該如何寫智慧合約](https://ithelp.ithome.com.tw/users/20083367/ironman/5019)
* [2022 鐵人賽：那些關於 Ethereum 的事](https://ithelp.ithome.com.tw/users/20083367/ironman/5136)
* [2024 鐵人賽：淺入淺出 EVM Object Format](https://ithelp.ithome.com.tw/users/20083367/ironman/8062)
* [許願池](https://github.com/hydai/solidity-book/issues)

## 授權規則

本網站的文章、教學影片、與講義，除了特別標註之外，皆採用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hant) 授權。
另外，本網站的程式碼範例，則採用 [MIT License](https://opensource.org/licenses/MIT) 授權釋出。
