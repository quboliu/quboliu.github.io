使用内置 Image Gen 生成六张中文图。检查了事务边界、ACK 顺序、重试 ID 和保证范围；修正前三张图的系统标签及 2PC 决定箭头。

## 01-ack-gap

```text
Use case: infographic-diagram. Chinese editorial technical diagram for a DDIA blog. Landscape 3:2 white background, dark navy Chinese sans-serif, teal successful paths, orange retry/coordination, red failure X. Large crisp simplified Chinese labels; minimal text exactly as supplied, no extra English except identifiers ACK, ID, Kafka, XA, 2PC, Inbox, Outbox, COMMIT. Rounded rectangles and clear arrows, ample whitespace. Logical architecture and sequence illustration, not a physical deployment. Use only supplied labels, no invented protocol names.
Title "业务成功了，确认却丢了". Three vertical lifelines left to right "消息代理", "消费者", "业务数据库". Time flows top to bottom. First arrow broker to consumer "① 投递任务 ID=42"; consumer to DB "② 余额加 100"; DB tiny transaction block "提交成功"; DB back to consumer "③ 成功". Next consumer toward broker dashed arrow "④ ACK" ends in red X BEFORE reaches broker, note "确认丢失". Next broker to consumer orange arrow "⑤ 超时后重投 ID=42"; consumer to DB red arrow "⑥ 再次加 100". Bottom callout "没有去重：同一任务生效两次". Small footer "未收到确认，只能说明结果未知". Do not imply every timeout redelivers for all brokers; general conceptual example.
```

## 02-xa

```text
Use case: infographic-diagram. Chinese editorial technical diagram for a DDIA blog. Landscape 3:2 white background, dark navy Chinese sans-serif, teal successful paths, orange retry/coordination, red failure X. Large crisp simplified Chinese labels; minimal text exactly as supplied, no extra English except identifiers ACK, ID, Kafka, XA, 2PC, Inbox, Outbox, COMMIT. Rounded rectangles and clear arrows, ample whitespace. Logical architecture and sequence illustration, not a physical deployment. Use only supplied labels, no invented protocol names.
Title "方案一：把业务提交与消息确认放进同一事务". Top center "事务协调器" with durable document icon "持久化事务决定". Lower left box "消息代理（支持 XA）" text "消费确认参与事务"; lower right "数据库（支持 XA）" text "业务修改参与事务". Surround both with dashed boundary labeled "同一全局事务". Two numbered arrow sets from coordinator to BOTH participants: "① 准备" and "② 提交或中止". Center note "准备成功不等于已经提交". Bottom two outcome boxes: teal "提交：业务生效，消息确认"; gray "中止：业务回滚，消息可重投". Footer "决定或响应丢失：按持久化决定恢复；可能等待协调器". Side small disconnected gray box "普通外部接口" with label "未参与事务，不在保证范围". Do not show rollback as undoing already committed external effects.
```

## 03-inbox

```text
Use case: infographic-diagram. Chinese editorial technical diagram for a DDIA blog. Landscape 3:2 white background, dark navy Chinese sans-serif, teal successful paths, orange retry/coordination, red failure X. Large crisp simplified Chinese labels; minimal text exactly as supplied, no extra English except identifiers ACK, ID, Kafka, XA, 2PC, Inbox, Outbox, COMMIT. Rounded rectangles and clear arrows, ample whitespace. Logical architecture and sequence illustration, not a physical deployment. Use only supplied labels, no invented protocol names.
Title "方案二：非幂等操作，加上事务性去重". Left "消息代理" -> "消费者" arrow "任务 ID=42". Large database transaction boundary center right title "同一个数据库事务". Inside top-to-bottom boxes "① 插入处理记录：ID 唯一" -> decision diamond "首次插入？". Yes teal path "② 执行业务：余额加 100" -> "③ 提交". No orange path "跳过业务修改" -> "结束事务". Outside transaction box, consumer to broker return arrow "事务成功后 ACK". Below distinct replay strip "提交后 ACK 丢失 → 重投相同 ID → 唯一约束命中 → 不再加款". Footer "处理记录与业务修改：一起提交，一起回滚". Small note "唯一键包含处理方；记录保留覆盖重放窗口". Do not put HTTP side effects in DB transaction boundary.
```

## 04-outbox

```text
Use case: infographic-diagram. Chinese editorial technical diagram for a DDIA blog. Landscape 3:2 white background, dark navy Chinese sans-serif, teal successful paths, orange retry/coordination, red failure X. Large crisp simplified Chinese labels; minimal text exactly as supplied, no extra English except identifiers ACK, ID, Kafka, XA, 2PC, Inbox, Outbox, COMMIT. Rounded rectangles and clear arrows, ample whitespace. Logical architecture and sequence illustration, not a physical deployment. Use only supplied labels, no invented protocol names.
Title "方案三：本地事务 + Outbox + 下游去重". Arrange left-to-right service A, relay, broker, service B. Service A box titled "服务 A：同一数据库事务" contains three stacked items "Inbox 去重", "业务修改", "Outbox 待发事件"; label under "一起提交". Arrow from Outbox to "转发器 / CDC" to "消息代理" to service B. Service B titled "服务 B：同一数据库事务" contains "Inbox 去重" and "业务修改"; label "一起提交". Orange loop from relay via broker back relay labeled "发送成功后故障，可能再次发送". Repeat ID label on both message arrows "相同事件 ID". Lower band "Outbox 防止业务成功却漏发事件；Inbox 防止重复事件再次生效". Bottom note "各服务分别提交，不是跨服务原子事务". Only these components, clear arrow heads. No claim Outbox delivers exactly once.
```

## 05-eos

```text
Use case: infographic-diagram. Chinese editorial technical diagram for a DDIA blog. Landscape 3:2 white background, dark navy Chinese sans-serif, teal successful paths, orange retry/coordination, red failure X. Large crisp simplified Chinese labels; minimal text exactly as supplied, no extra English except identifiers ACK, ID, Kafka, XA, 2PC, Inbox, Outbox, COMMIT. Rounded rectangles and clear arrows, ample whitespace. Logical architecture and sequence illustration, not a physical deployment. Use only supplied labels, no invented protocol names.
Title "方案四：恰好一次语义有明确边界". Upper panel title "Kafka：读取—处理—写回". "输入主题" -> "处理器" -> dashed orange boundary "同一 Kafka 事务" containing two blocks "输出消息" and "输入消费位点"; arrow out to "下游：只读已提交消息". Label below "提交：输出与位点一起生效；中止：输出不对已提交读者可见". Next to processor disconnected external block "外部数据库 / HTTP 接口" red dotted boundary label "不会自动加入 Kafka 事务". Lower panel title "Flink：检查点与外部输出". sequential blocks "可重放输入" -> "算子状态与检查点" -> "支持相应协议的输出端". Footer "算子状态恰好一次，不代表任意外部副作用恰好一次". No dense identifiers or version claims. Include cache/state changes only in Flink panel.
```

## 06-external

```text
Use case: infographic-diagram. Chinese editorial technical diagram for a DDIA blog. Landscape 3:2 white background, dark navy Chinese sans-serif, teal successful paths, orange retry/coordination, red failure X. Large crisp simplified Chinese labels; minimal text exactly as supplied, no extra English except identifiers ACK, ID, Kafka, XA, 2PC, Inbox, Outbox, COMMIT. Rounded rectangles and clear arrows, ample whitespace. Logical architecture and sequence illustration, not a physical deployment. Use only supplied labels, no invented protocol names.
Title "方案五：外部副作用，把重试变成同一次请求". Two panels. Left 65% title "外部服务支持幂等键". Three lifelines "业务服务","外部服务","本地任务记录". service->external "① 请求：业务 ID=42"; external box "执行一次，保存结果"; external->service response ends red X "② 响应丢失"; service->external orange arrow "③ 相同 ID 重试"; external->service teal "返回原结果，不再执行"; service->local "④ 保存成功状态"; bottom left note "重试复用 ID 与参数；遵守有效期". Right 35% title "外部服务不支持去重或事务". Top box "请求超时：结果未知" -> two branches orange "直接重试：可能重复" and gray "放弃重试：可能遗漏"; both -> final box "查单 / 回调 / 对账 / 人工核实". Footer "无法确认旧请求是否生效时，不能单靠重试承诺恰好一次". No assertion query not found authorizes retry, no guaranteed exactly once for unknown service.
```

## 定向修订

[
  {
    "name": "01-ack-gap",
    "path": "/home/xuntingmu/.codex/generated_images/01a08915-8552-7c51-b7b3-1fc76f3ac516/exec-e9354fcc-bd3a-4556-81df-0e0bf46aec77.png",
    "prompt": "只删除左上“消息代理”框中的 Kafka 一词，保留“消息代理”。这是通用消息队列示意，不能特指 Kafka。其余全部保持不变。"
  },
  {
    "name": "02-xa",
    "path": "/home/xuntingmu/.codex/generated_images/01a08915-8552-7c51-b7b3-1fc76f3ac516/exec-b24d09f7-8dd4-46be-bfdf-91f235058b97.png",
    "prompt": "修正两条绿色箭头方向：标注“② 提交或中止”的两条绿色箭头都必须从上方事务协调器指向下方两个参与者（左侧消息代理、右侧数据库），不能从参与者指向协调器。橙色①准备箭头方向正确，不动。其余图中文字、布局、配色全部保持不变。"
  },
  {
    "name": "03-inbox",
    "path": "/home/xuntingmu/.codex/generated_images/01a08915-8552-7c51-b7b3-1fc76f3ac516/exec-8c9bdfca-9b60-4961-83d5-50627d1d49aa.png",
    "prompt": "仅删除左侧“消息代理”框中的 Kafka 一词；保留“消息代理”。这是通用消息代理示意。其余全部保持不变。"
  }
]
