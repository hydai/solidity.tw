(window.webpackJsonp=window.webpackJsonp||[]).push([[33],{316:function(e,r,t){"use strict";t.r(r);var a=t(10),n=Object(a.a)({},(function(){var e=this,r=e._self._c;return r("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[r("h1",{attrs:{id:"以太坊改良提案-ethereum-improvement-proposals-eip"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#以太坊改良提案-ethereum-improvement-proposals-eip"}},[e._v("#")]),e._v(" 以太坊改良提案 Ethereum Improvement Proposals (EIP)")]),e._v(" "),r("p",[e._v("由於「在 2022 年我們該如何寫智能合約」影片系列即將進入與 ERC20 代幣等相關的主題，因此我們接下來幾天會依序來聊聊什麼是 EIP 與 ERC，以及目前主流的幾個 ERC 的標準。")]),e._v(" "),r("h2",{attrs:{id:"什麼是以太坊改良提案"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#什麼是以太坊改良提案"}},[e._v("#")]),e._v(" 什麼是以太坊改良提案")]),e._v(" "),r("p",[e._v("以太坊改良提案的標準被定義在 "),r("a",{attrs:{href:"https://eips.ethereum.org/EIPS/eip-1",target:"_blank",rel:"noopener noreferrer"}},[e._v("EIP 提案編號 1"),r("OutboundLink")],1),e._v("。本文將以 EIP-1 為主，進行修改與翻譯所寫成。")]),e._v(" "),r("p",[e._v("以太坊改良提案 Ethereum Improvement Proposals，簡稱 EIPs ，它是一份設計文件用來描述提案內容、定義以太坊的新功能或新特性、或定義新流程。\n在這份文件中，應該提供清晰簡潔的功能技術規格、需要這個改良的理由。且提案者須負責跟社群進行溝通，並記錄下各種不同的意見與建議。在取得共識之後，才會正式被承認。")]),e._v(" "),r("h2",{attrs:{id:"以太坊改良提案的種類"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#以太坊改良提案的種類"}},[e._v("#")]),e._v(" 以太坊改良提案的種類")]),e._v(" "),r("p",[e._v("一般來說，EIP 可分為三大類：")]),e._v(" "),r("ol",[r("li",[r("p",[e._v("Standards Track EIP：\n任何大幅對以太坊實作相關的改變都應屬於此種類，包含但不限於：對網路協議的修改、對區塊或交易的驗證機制的修改、對應用標準的修訂等等。\nStandards Track EIP 須包含以下幾個部分：\nA. 設計文件（design document）\nB. 實作（implementation）\nC. 對正式規格的更新（updated formal specification）\n且他通常會再被細分成以下四個子種類：\n1.1. 核心（Core）：這類的修改可能需要仰賴共識分叉，如 "),r("a",{attrs:{href:"https://eips.ethereum.org/EIPS/eip-5",target:"_blank",rel:"noopener noreferrer"}},[e._v("EIP-5: Gas Usage for "),r("code",[e._v("RETURN")]),e._v(" and "),r("code",[e._v("CALL*")]),r("OutboundLink")],1),e._v(", "),r("a",{attrs:{href:"https://eips.ethereum.org/EIPS/eip-101",target:"_blank",rel:"noopener noreferrer"}},[e._v("EIP-101: Serenity Currency and Crypto Abstraction"),r("OutboundLink")],1),e._v("；或者不一定需要共識分叉但對核心開發（Core Dev）息息相關，如："),r("a",{attrs:{href:"https://eips.ethereum.org/EIPS/eip-86",target:"_blank",rel:"noopener noreferrer"}},[e._v("EIP-86: Abstraction of transaction origin and signature"),r("OutboundLink")],1),e._v("\n1.2. 網路（Networking）：這類的修改著重在 "),r("code",[e._v("devp2p")]),e._v("，如 "),r("a",{attrs:{href:"https://eips.ethereum.org/EIPS/eip-8",target:"_blank",rel:"noopener noreferrer"}},[e._v("EIP-8: devp2p Forward Compatibility Requirements for Homestead"),r("OutboundLink")],1),e._v(" ；輕量以太坊子協議（Light Ethereum Subprotocol）；或針對 "),r("code",[e._v("whisper")]),e._v(" 與 "),r("code",[e._v("swarm")]),e._v(" 的網路協議規格的改進。\n1.3. 介面（Interface）：包含對客戶端的 API 或 RPC 的規格與標準的改進；對語言層級標準的改進，像是 EVM 指令的改進，如："),r("a",{attrs:{href:"https://eips.ethereum.org/EIPS/eip-6",target:"_blank",rel:"noopener noreferrer"}},[e._v("EIP-6: Renaming SUICIDE opcode"),r("OutboundLink")],1),e._v("；與合約的 ABIs 定義。\n1.4. ERC：應用層級的標準與公約，包含合約的標準，如："),r("a",{attrs:{href:"https://eips.ethereum.org/EIPS/eip-20",target:"_blank",rel:"noopener noreferrer"}},[e._v("代幣標準 EIP-20"),r("OutboundLink")],1),e._v("，"),r("a",{attrs:{href:"https://eips.ethereum.org/EIPS/eip-137",target:"_blank",rel:"noopener noreferrer"}},[e._v("以太坊域名系統 EIP-137"),r("OutboundLink")],1),e._v("，函式庫或套件的格式，與錢包的格式等。")])]),e._v(" "),r("li",[r("p",[e._v("Meta EIP (或 Process EIP)")])])]),e._v(" "),r("p",[e._v("流程型 EIP ，描述了對以太坊的流程，或對現存流程的修正。流程型 EIP 定義了除在 Standards Track EIPs 裡面所提的以太坊協議本體外的其他領域。如：提出一個無關以太坊程式碼庫(Ethereum's codebase)的實作。這類型的 EIP 通常需要得到社群的共識，因此開發者與使用者都必須重視以待。例如：程序、指南、對決定流程的改變、對開發工具或開發環境的修改等。")]),e._v(" "),r("ol",{attrs:{start:"3"}},[r("li",[e._v("資訊型 EIP（Informational EIP）")])]),e._v(" "),r("p",[e._v("資訊型的 EIP 描述了對以太坊的設計主題、提供給以太坊社群通用的指南或資訊，但不包含提出新的特性或功能。\n且資訊型 EIP 不需要取得以太坊社群的共識或者推薦，因此使用者與開發者不需要特別在意資訊型 EIP，也不一定要遵守裡頭的建議。")]),e._v(" "),r("h2",{attrs:{id:"eip-的核心概念"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#eip-的核心概念"}},[e._v("#")]),e._v(" EIP 的核心概念")]),e._v(" "),r("p",[e._v("一個 EIP 應著重在擔一個關鍵提案或者想法，越專注在單點，則越容易讓 EIP 被接受。反之，一個包山包海且過分複雜的 EIP 很難被社群接受。\n此外，有共通性的修改才需要發起 EIP，若只針對特定的客戶端的修改，那不需要 EIP，只需要去該客戶端那發問即可；反之，當這個修改需要仰賴多個客戶端、或定義會影響到眾多應用的新標準就需要發起 EIP。")]),e._v(" "),r("h2",{attrs:{id:"eip-的限制"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#eip-的限制"}},[e._v("#")]),e._v(" EIP 的限制")]),e._v(" "),r("p",[e._v("每一個 EIP 都需達到最低的標準。它必須有一份清晰且對於提案的改良有著完善描述。且提出的實作必須是穩固且不會過份複雜化協議。")]),e._v(" "),r("h2",{attrs:{id:"關於核心-eips-的特殊要求"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#關於核心-eips-的特殊要求"}},[e._v("#")]),e._v(" 關於核心 EIPs 的特殊要求")]),e._v(" "),r("p",[e._v("若 Core EIP 需要修改以太坊虛擬機，在文件中應參照到該指令或以以下格式定義指令：")]),e._v(" "),r("div",{staticClass:"language- extra-class"},[r("pre",{pre:!0,attrs:{class:"language-text"}},[r("code",[e._v("REVERT (0xfe)\n")])])])])}),[],!1,null,null,null);r.default=n.exports}}]);