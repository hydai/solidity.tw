# POAP - Proof Of Attendance Protocol 參與證明

POAP 被設計出來作為一種數位回憶，在他的格式中記錄了「該活動的名字」、「時間」、「地點」、「紀念圖」等資訊。
雖然也是使用 ERC721 NFT 的標準為基底，但他加上了些許的限制，比如說 POAP 只發給參加活動的參與者，申請 POAP 的發放者必須承擔起責任檢查領取的人是否真的有參與活動。

## 使用流程

活動發放者需要先去 POAP 平台上申請，需要先填寫：

1. 活動名字與資訊
2. 活動地點
3. 發放的時間區間（只有在這個區間內才能領到該活動的 POAP）
4. 活動的紀念照片（會作為該 POAP 的顯示圖片）

在申請以後，POAP 組織會審核這個活動，如無問題，通常在 24 小時內就能獲得批准。

之所以多了一個審核機制是因為目前 POAP 發行在 xDai 區塊鏈上，如我們之前提到的燃料費用問題一樣，POAP 平台是免費提供這個服務，因此燃料費是由他們那邊所支付，為了避免濫用與惡意使用，因此才需要多做審核。

再通過審核後，就只需要活動的參加者去申請該 POAP 即可獲得。

## 例子

### 參與專案開發的證明

[GitPOAP 服務](https://www.gitpoap.io/)，這個服務連結了你的錢包與 GitHub/GitLab 帳號，當你貢獻過有參與 GitPOAP 服務的專案時，他會發行對應的 POAP 給你，證明你在該年度有貢獻過，以資鼓勵。

如下圖，是我在 2018~2019 年貢獻過 solidity 與 go-ethereum 兩個專案所獲得的 POAP。

![](https://i.imgur.com/WcRtzol.png)

![](https://i.imgur.com/Tz4mq93.png)

### 捐款證明

比如說以下的 POAP 就是在 Mainnet Merge 派對時，只要捐款到特定帳號，就能獲得這枚捐款 POAP。

![](https://i.imgur.com/XslYY7y.png)

本次捐款活動細節，可以參考以下影片： https://www.youtube.com/watch?v=ZY7eXUn7Mpo

## 相關連結

[官網](https://poap.xyz/)
