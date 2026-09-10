使用内置 Image Gen 生成中文架构图；以下保存原始提示词与定向修订记录。

最终标签修订：
[{"name":"redpanda","path":"/home/xuntingmu/.codex/generated_images/01a08915-8552-7c51-b7b3-1fc76f3ac516/exec-5a8e90a9-9478-487f-a4d9-331479e2f417.png","prompt":"只改一处：左下消费组协调器内，英文内部主题名称拼写错误。删除这行英文，替换为中文“消费位点内部主题”。保留下面“复制的内部主题”。其余全部原样，不改布局和箭头。"},{"name":"pulsar","path":"/home/xuntingmu/.codex/generated_images/01a08915-8552-7c51-b7b3-1fc76f3ac516/exec-e36e87b0-d40d-49c3-8b54-e8347b94fcf4.png","prompt":"只精确修改底部蓝色横条的文字，整行替换为：“生产确认：等待 BookKeeper 持久化确认；不等待对象存储卸载”。确保汉字正确，去掉原来的“送到配置的”等字样。去掉 ZooKeeper 框上方、Ledger 副本位置标签左侧那条短小悬空的橙色双向箭头；保留连接 Broker 和 BookKeeper 的两条完整橙色线。其余原样。"}]

## kafka

```text
Use case: infographic-diagram. Create a publication-quality Chinese technical architecture diagram, landscape 3:2, approximately 2048x1360. White background, navy text, teal solid arrows for message data, orange dashed arrows for metadata/control, gray dotted arrows for background offload/compaction. All explanation text MUST be simplified Chinese, retaining official component names and protocol identifiers. Large readable Chinese sans-serif, spacious grid, no decorative art, no logos. Show a logical architecture, not a physical machine-count claim. Use clear arrowheads, short labels, avoid crossing lines. Bottom legend exactly: "实线：消息数据　虚线：元数据与协调　点线：后台搬迁". Include a bottom ACK strip as specified, avoiding ambiguous arrows.
Title "Apache Kafka：分层存储架构". Subtitle "KRaft 模式 · 消息与元数据分开看".
Upper data area: 生产者 -> 分区领导副本（Broker） -> 追随副本（其他 Broker）, arrow replication labeled "日志复制 / ISR"; each replica shows "本地日志与页缓存". 消费者 requests "读取" from leader, leader returns "消息". leader contains "远端日志管理器", sends completed segments by dotted arrow labeled "已封闭日志段异步上传" to "对象存储：历史日志段与索引"; object store to leader teal arrow "历史回读". No producer writes directly to object storage.
Lower metadata area 3 distinct boxes: "KRaft 控制器仲裁组" with "Raft 复制：集群、主题、分区、副本分配"; orange bidirectional connection to Brokers. "消费组 / 事务协调器（Broker 内）" with "复制的内部主题：__consumer_offsets / __transaction_state"; orange consumer to coordinator "提交消费位点". "远端日志元数据管理器" with "默认实现：复制的内部主题 __remote_log_metadata"; orange link with remote log manager "日志段位置与生命周期". KRaft does NOT contain consumer offsets or remote segment metadata. Footer ACK strip "写入确认（acks=all）：等待 ISR 满足复制条件；不等待对象存储上传". small note "复制确认不等于每条消息都已 fsync；远端存储需适配实现".
```

## pulsar

```text
Use case: infographic-diagram. Create a publication-quality Chinese technical architecture diagram, landscape 3:2, approximately 2048x1360. White background, navy text, teal solid arrows for message data, orange dashed arrows for metadata/control, gray dotted arrows for background offload/compaction. All explanation text MUST be simplified Chinese, retaining official component names and protocol identifiers. Large readable Chinese sans-serif, spacious grid, no decorative art, no logos. Show a logical architecture, not a physical machine-count claim. Use clear arrowheads, short labels, avoid crossing lines. Bottom legend exactly: "实线：消息数据　虚线：元数据与协调　点线：后台搬迁". Include a bottom ACK strip as specified, avoiding ambiguous arrows.
Title "Apache Pulsar：分层存储架构". Subtitle "持久化主题 · BookKeeper + ZooKeeper 示例".
Upper main area 生产者 -> "主题所属 Broker" (inside "缓存 / Managed Ledger / 分发器 / Offloader") -> "BookKeeper 存储集群"; draw broker fanout to three bookie icons, labels "并行写入多个 Bookie" not bookies chained replication. Storage label "消息 Ledger + 持久化订阅游标" and "Journal / Entry Log". 消费者 bidirectional broker with separately labeled "消息投递" and "消费确认". Broker receives message data from BookKeeper on read cache miss.
Right object store "对象存储：已封闭 Ledger"; background dotted path from BookKeeper via broker Offloader to object store labeled "异步卸载"; teal store to broker "历史回读"; note "卸载成功后按策略清理本地副本".
Lower metadata box "ZooKeeper 元数据集群" "租户与命名空间配置 / 主题归属 / Managed Ledger 元信息 / Ledger 副本位置"; orange connections to broker and bookkeeper; label "集群协调与元数据一致性". Add small note "元数据服务可替换；图示 ZooKeeper 部署". Make clear cursor data primarily persisted in BookKeeper, not all consumer progress solely ZooKeeper.
Footer ACK strip "生产确认：BookKeeper 达到配置的持久化确认数后返回；不等待对象存储卸载".
```

## warpstream

```text
Use case: infographic-diagram. Create a publication-quality Chinese technical architecture diagram, landscape 3:2, approximately 2048x1360. White background, navy text, teal solid arrows for message data, orange dashed arrows for metadata/control, gray dotted arrows for background offload/compaction. All explanation text MUST be simplified Chinese, retaining official component names and protocol identifiers. Large readable Chinese sans-serif, spacious grid, no decorative art, no logos. Show a logical architecture, not a physical machine-count claim. Use clear arrowheads, short labels, avoid crossing lines. Bottom legend exactly: "实线：消息数据　虚线：元数据与协调　点线：后台搬迁". Include a bottom ACK strip as specified, avoiding ambiguous arrows.
Title "WarpStream：对象存储原生架构". Subtitle "Kafka 协议兼容 · 客户数据面与托管控制面".
Large left boundary "客户数据面": 生产者 -> "无状态 Agent 池" with 3 agent icons, labels "任意 Agent 可接收任意分区 / 多分区攒批"; agent to "客户对象存储" solid arrow "① 持久化消息对象"; object store label "消息正文 / 存储服务负责冗余"; no per-partition leader and no durable agent log. 消费者 bidirectional agent "读取消息 / 提交消费位点". Cache box inside agent pool "每个可用区的分布式内存缓存"; reads from object store to cache to agent to consumer; label "未命中时按块加载". Dotted agent to object storage "后台合并与到期清理".
Right boundary "WarpStream 托管控制面": "元数据服务" with "分区顺序 / offset → 文件与批次 / 消费组与已提交位点"; under it "复制状态机 + 强一致日志" with 3 nodes; "调度服务：合并、缓存分工、清理". Orange Agent to metadata "② 提交文件元数据 / 确定顺序"; orange metadata to agent "读取位置与顺序"; orange agent to metadata "提交消费位点"; dotted orange control to agent "任务调度". Label boundary "仅元数据进入控制面"; ensure no message正文 arrow crosses to control plane.
Footer ACK strip "① 对象持久化 → ② 元数据提交 → ③ 向生产者确认". Small note "Agent 无需持久化磁盘；元数据服务仍有复制与协调".
```

## redpanda

```text
Use case: infographic-diagram. Create a publication-quality Chinese technical architecture diagram, landscape 3:2, approximately 2048x1360. White background, navy text, teal solid arrows for message data, orange dashed arrows for metadata/control, gray dotted arrows for background offload/compaction. All explanation text MUST be simplified Chinese, retaining official component names and protocol identifiers. Large readable Chinese sans-serif, spacious grid, no decorative art, no logos. Show a logical architecture, not a physical machine-count claim. Use clear arrowheads, short labels, avoid crossing lines. Bottom legend exactly: "实线：消息数据　虚线：元数据与协调　点线：后台搬迁". Include a bottom ACK strip as specified, avoiding ambiguous arrows.
Title "Redpanda Cloud Topics：消息与元数据分离". Subtitle "Cloud Topics 模式 · 非传统分层存储".
Main top: 生产者 -> "Broker：Kafka API / 内存攒批" -> "对象存储：L0 消息对象" arrow "① 上传消息正文". Broker -> "每分区 Raft 组：领导者 + 追随者" orange arrow "② 复制占位批次"; Raft contents "L0 对象位置 / 分区日志顺序 / 事务与幂等状态"; message正文 must not flow through Raft in this mode. Label "③ 元数据提交后确认生产请求" return broker to producer or ACK strip.
Object storage large right container includes separate L0 and L1 blocks "L1：按分区整理的消息对象". Center "后台整理器 Reconciler" dotted read L0 and write L1. lower "共享元数据服务 Metastore" with "offset → L1 对象 / 分区范围" and "内置键值存储 + 内部主题 Raft 组"; connect reconciler metadata update to it. Show metadata persisted snapshots/tables to object storage separate block "元数据 SST 与 Manifest" dotted labeled "后台持久化"; do not imply snapshot synchronous with ACK.
消费者 <-> Broker "读取 / 提交消费位点". Broker read path tiny "内存缓存优先；L0 查分区日志；L1 查 Metastore" with orange links to Raft and metastore and teal object -> broker data reads.
Bottom control boxes "消费组协调器 → __consumer_offsets（复制的内部主题）" with consumer offset orange connection via Broker; "集群控制器 Raft 组：成员、主题与配置" orange broker link.
Footer ACK strip "消息对象持久化 + 分区 Raft 元数据提交 → 生产确认". note "正文由对象存储保护；元数据仍依赖 Raft".
```

{
  "edits": [
    {
      "name": "kafka",
      "path": "/home/xuntingmu/.codex/generated_images/01a08915-8552-7c51-b7b3-1fc76f3ac516/exec-932b4632-c39d-46c3-9ea9-a0edf76aa7c1.png",
      "prompt": "精确修改这张中文架构图，保持全部结构和其余文字不变。右侧对象存储框中的“如 S3 / HDFS / 对象存储”改成“如 S3 / 兼容对象存储”。HDFS 是文件系统，不能列为对象存储示例。其余内容保持原样，中文清晰。"
    },
    {
      "name": "pulsar",
      "path": "/home/xuntingmu/.codex/generated_images/01a08915-8552-7c51-b7b3-1fc76f3ac516/exec-2bb19378-251a-4067-a3e4-3deaa558f994.png",
      "prompt": "精确修正这张中文架构图，其余布局与文字保持。1. 对象存储到 Broker 的“历史回读”下方错误的“(Pulsar Protocol)”改为“（对象存储接口）”。2. 对象存储框底部“如 S3、HDFS、云对象存储等”改为“如 S3、云对象存储等”，HDFS 不是对象存储。3. 底部确认条中的“送到配置”纠正为“达到配置”：完整文字“生产确认：BookKeeper 达到配置的持久化确认数后返回；不等待对象存储卸载。” 4. ZooKeeper 上方右侧悬空的橙色双向虚线，延长并连接到 BookKeeper 存储集群边框，标签“Ledger 副本位置”。其余不变。"
    }
  ],
  "warp": "修正这张架构图中的连接关系，保留中文标题、分区、节点、配色和底部确认流程。重要：对象存储不主动提交元数据，也不接收调度服务的任务。所有橙色跨控制面的虚线都必须连接“无状态 Agent 池”和“元数据服务 / 调度服务”，不得连接对象存储桶。把“②提交文件元数据”“提交消费位点”两条虚线起点改到 Agent 池边框、终点为元数据服务；“读取位置与顺序”的终点改到 Agent 池；“任务调度”的起点为右侧调度服务、终点为 Agent 池。可沿顶部或底部绕行，避免穿过桶。消费者右向 Agent 的箭头标签改为“读取请求 / 提交消费位点”；Agent 指向消费者的返回箭头标签改为“返回消息”。其余保持。",
  "final": [
    {
      "name": "kafka",
      "path": "/home/xuntingmu/.codex/generated_images/01a08915-8552-7c51-b7b3-1fc76f3ac516/exec-c1a717bc-c8e1-4a42-a243-54bec71a2601.png",
      "prompt": "仅修改一处：右上对象存储框标题下的小字出现乱码。把那一整行小字全部删除，留空。其余全部保持不变。"
    },
    {
      "name": "redpanda",
      "path": "/home/xuntingmu/.codex/generated_images/01a08915-8552-7c51-b7b3-1fc76f3ac516/exec-c879f4e1-4f11-4160-bb76-9ef97cbf4aea.png",
      "prompt": "精确修正这张中文架构图，保留主体结构和所有其余正确内容。1 生产者到Broker的标签改为“发送消息”，不加①；Broker到对象存储的①保留，下方错误“Kafka API / S3”改为“对象存储接口”。2 消费者指向Broker的箭头标签改为“读取请求 / 提交消费位点”，反方向返回消费者的标签改为“返回消息”。3 L0内部说明改成“多分区攒批，尚未整理”，不写按写入顺序。4 后台整理器的“读取 L0”灰色虚线必须来自对象存储里的L0框，不能来自L1框；“写入L1”保留。5 在对象存储至Broker之间添加一条青色反向回读箭头，标签“读取消息对象”。6 右下“元数据 SST 与 Manifest”框上方标注“对象存储中的元数据文件”。7 消费组协调器内部的主题标识符精确修正为“__consumer_offsets”。确保无乱码，尤其offsets。"
    }
  ]
}
