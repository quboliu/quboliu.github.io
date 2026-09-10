Built-in image_gen was used. Image visually checked for wording and write/commit/ACK order.

```text
Use case: infographic-diagram
Asset type: Architecture illustration for a concise Chinese engineering blog inspired by DDIA Chapter 12.
Create a polished editorial diagram, landscape 3:2, white background, dark navy typography, teal data path, orange metadata accents. Crisp generous spacing, minimal flat vector-like raster design. All labels in English to ensure readability.
Title exactly: "Who owns durability?"
Two stacked panels showing simplified successful durable write paths. Use numbered boxes with arrows strictly flowing left to right. ACK is always last, never before durable commit.
Top panel heading: "Broker-replicated log"
Four boxes: "1  Receive" -> "2  Replicate log" -> "3  Commit" -> "4  ACK".
Below box 2 show three small server/disk icons connected, caption "Message data on broker replicas".
Bottom panel heading: "Object-storage-first log"
Four boxes: "1  Batch" -> "2  Persist objects" -> "3  Commit metadata" -> "4  ACK".
Below box 2 show an object storage bucket inside a pale teal boundary with three small storage icons, caption "Storage service owns redundancy".
Below box 3 show three tiny orange connected metadata nodes, caption "Ordering and offsets still need coordination".
Bottom footer exactly: "Data durability can move down a layer. Message semantics still need an owner."
No vendor logos, no quantitative latency claims, no extra arrows between panels. Accurate text and clean alignment. Do not imply object storage automatically implements queue semantics.
```
