# Knowledge runtime audit and frontend coverage

- **Audited:** 2026-08-19
- **Authority:** runtime source at this revision, not roadmap language
- **Scope:** `knowledge`, `knowledge-intelligence`, `knowledge-factory`, their guards/DTOs/services, and the Knowledge web feature

## 1. Executive status

| Resource               | Runtime status                                                                                  | Web coverage                                                                                                                                                             | Decision                                                                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Knowledge CMS          | **Active** in `ApiModule`                                                                       | Substantial: CRUD, discovery, lifecycle, workflow, versions, taxonomy, standards, analytics, comments, translations, localization preview, media, formulas, and examples | Production-facing, subject to normal permission/data availability                                                                                            |
| Knowledge Intelligence | **Active** in `ApiModule`                                                                       | All 28 HTTP contracts are audited; the console covers every capability, using the generic top-metric route instead of the redundant authority-ranking route              | Operational, with the shared authorization fail-open caveat below; an empty result means no matching workspace graph data unless the UI reports an API error |
| Knowledge Factory      | **Dormant**: module is not imported by `ApiModule`                                              | Deliberately not exposed                                                                                                                                                 | Do not describe or display it as available; activation requires queue, worker, contract, and service completion                                              |
| Semantic integration   | **Active**, with 14 contracts and four handlers; CMS lifecycle producers work, Factory does not | No direct UI                                                                                                                                                             | Treat persistent enqueue, handler completion, and the dormant ingestion pipeline as separate guarantees                                                      |

The architecture files describe target architecture as well as implementation. In particular, “complete” claims for Knowledge Factory in `docs/PROJECT_BOOTSTRAP.md`, `knowledge-factory-architecture.md`, and `semantic-integration-implementation.md` do **not** mean its HTTP routes are active or its ingestion pipeline is production-ready.

## 2. Authentication, workspace isolation, and response contract

### Knowledge CMS

Authenticated controllers use `JwtAuthGuard`, `WorkspaceGuard`, and `PermissionsGuard`. Services additionally resolve articles in the active workspace. Permissions follow the dotted convention, chiefly `knowledge.read`, `knowledge.create`, `knowledge.update`, `knowledge.delete`, `knowledge.publish`, and workflow-specific permissions. Public routes are isolated under `/public/knowledge`.

### Knowledge Intelligence

All 28 endpoints require a JWT, active workspace, permissions, and (where graph identifiers are accepted) `GraphWorkspaceGuard`. Intelligence reads generally require `knowledge.read`; mutation endpoints use their controller-specific update permissions. `GraphWorkspaceGuard`:

- validates node identifiers found in route and query parameters against the active workspace;
- rejects existing cross-workspace graph nodes;
- allows at most 100 graph IDs in one request and rejects identifiers longer than 128 characters.

This is graph-resource isolation, not merely the presence of a workspace header. Query DTOs also reject blank or punctuation-only graph searches, unsupported neighbor directions, oversized edge types, and empty/oversized subgraph lists; numeric traversal, ranking, clustering, and freshness inputs are parsed with endpoint-specific bounds.

**Shared authorization caveat:** the controllers declare dotted permissions and `WorkspaceGuard` resolves membership before `PermissionsGuard`, but the shared `PermissionsGuard` catches unexpected authorization-service exceptions and returns `true` after logging. Explicit denials still fail, but a database/service exception can fail open. This behavior predates the Knowledge implementation and sits outside the Knowledge-only edit scope; it must be changed to fail closed before these routes can receive a strong production authorization assurance.

### Knowledge Factory

Factory controllers use JWT and permissions but do not consistently use `WorkspaceGuard`, use three incompatible permission namespaces (`knowledge.*`, `knowledge:*`, and `knowledge-factory:*`), and some routes trust a document ID without an explicit controller-level workspace guard. This is another blocker to activation.

### Envelope

Active authenticated APIs return an envelope of the form:

```json
{ "success": true, "data": {} }
```

The base Web `apiClient` validates but does not unwrap that envelope. New Intelligence and rich-content surfaces therefore use `knowledgeApi`, which unwraps `data` once and keeps component contracts typed.

## 3. Active Knowledge CMS resources

### Article, lifecycle, workflow, and analytics

| Method and route                                  | Capability                  | Management UI                                      |
| ------------------------------------------------- | --------------------------- | -------------------------------------------------- |
| `GET /knowledge`                                  | Paginated listing/filtering | Superseded in the current list UX by server search |
| `POST /knowledge`                                 | Create article              | Covered (quick and full-page creation)             |
| `GET /knowledge/search`                           | Search/filter articles      | Covered                                            |
| `GET /knowledge/slug/:slug`                       | Authenticated slug lookup   | Not directly exposed                               |
| `GET /knowledge/:id`                              | Article detail              | Covered                                            |
| `PATCH /knowledge/:id`                            | Article update              | Covered                                            |
| `DELETE /knowledge/:id`                           | Delete                      | Covered                                            |
| `POST /knowledge/:id/review`                      | Legacy review transition    | Covered                                            |
| `POST /knowledge/:id/publish`                     | Publish                     | Covered                                            |
| `POST /knowledge/:id/reject`                      | Legacy review rejection     | Covered                                            |
| `POST /knowledge/:id/archive`                     | Archive                     | Covered                                            |
| `POST /knowledge/:id/restore`                     | Restore archived article    | Covered                                            |
| `GET /knowledge/:id/taxonomy`                     | Assigned taxonomy           | Covered                                            |
| `POST /knowledge/:id/taxonomy`                    | Assign taxonomy             | Covered                                            |
| `DELETE /knowledge/:id/taxonomy/:taxonomyId`      | Remove assignment           | Covered                                            |
| `GET /knowledge/:id/versions`                     | Version history             | Covered                                            |
| `GET /knowledge/:id/versions/:versionId`          | One historical version      | Not directly exposed                               |
| `POST /knowledge/:id/versions/:versionId/restore` | Restore version             | Covered                                            |
| `GET /knowledge/:id/comments`                     | Comments                    | Covered                                            |
| `POST /knowledge/:id/comments`                    | Comment/reply               | Covered                                            |
| `PATCH /knowledge/:id/comments/:commentId`        | Edit comment                | Covered                                            |
| `DELETE /knowledge/:id/comments/:commentId`       | Delete comment              | Covered                                            |
| `GET /knowledge/:id/workflow`                     | Current workflow/history    | Covered                                            |
| `POST /knowledge/:id/workflow/submit`             | Submit workflow             | Covered                                            |
| `POST /knowledge/:id/workflow/approve`            | Approve workflow            | Covered                                            |
| `POST /knowledge/:id/workflow/reject`             | Reject workflow             | Covered                                            |
| `GET /knowledge/by-calculator/:calculatorType`    | Find by calculator          | Not directly exposed                               |
| `GET /knowledge/:id/related-calculations`         | Related calculators         | Covered                                            |
| `GET /knowledge/analytics/dashboard`              | Workspace dashboard         | Covered                                            |
| `GET /knowledge/:id/analytics`                    | Article analytics           | Covered                                            |
| `POST /knowledge/:id/view`                        | Record view                 | Covered                                            |

> Route declaration order matters: static routes such as `search`, `analytics/dashboard`, and `by-calculator` are declared before the generic `:id` routes in the controller where needed.

### Rich content

| Method and route                                  | Capability                                  | Management UI             |
| ------------------------------------------------- | ------------------------------------------- | ------------------------- |
| `GET /knowledge/:id/translations`                 | List translations                           | Covered                   |
| `GET /knowledge/:id/translations/:language`       | One translation                             | List data is used instead |
| `PUT /knowledge/:id/translations`                 | Locale upsert                               | Covered                   |
| `DELETE /knowledge/:id/translations/:language`    | Delete non-primary translation              | Covered                   |
| `GET /knowledge/:id/localized?locale=`            | Localized projection with fallback metadata | Covered as a preview      |
| `GET/POST /knowledge/:id/media`                   | List/attach media                           | Covered                   |
| `PATCH/DELETE /knowledge/:id/media/:mediaId`      | Edit/detach media                           | Covered                   |
| `GET/POST /knowledge/:id/formulas`                | List/create formulas                        | Covered                   |
| `PATCH/DELETE /knowledge/:id/formulas/:formulaId` | Edit/delete formula                         | Covered                   |
| `GET/POST /knowledge/:id/examples`                | List/create worked examples                 | Covered                   |
| `PATCH/DELETE /knowledge/:id/examples/:exampleId` | Edit/delete worked example                  | Covered                   |
| `POST /knowledge/:id/comments/:commentId/like`    | Like a comment                              | Not exposed               |
| `DELETE /knowledge/:id/comments/:commentId/like`  | Unlike a comment                            | Not exposed               |

Rich-content attachment currently accepts an existing URL; it does not upload a binary to Storage. The UI says “attach” rather than implying an upload pipeline.

### Standards, taxonomy registry, and public delivery

| Route group                         | Capabilities                             | Web coverage                        |
| ----------------------------------- | ---------------------------------------- | ----------------------------------- |
| `/knowledge/:id/standards`          | list, add, remove article-standard links | Covered                             |
| `/taxonomy`, `/taxonomy/:type`      | taxonomy registry and type lookup        | Covered by article assignment UX    |
| `/public/knowledge`                 | public list                              | Covered                             |
| `/public/knowledge/:slug`           | public detail                            | Covered; uses slug, not internal ID |
| `/public/knowledge/:slug/localized` | public localized projection              | Not directly exposed                |

Authenticated article routes remain under `/{locale}/knowledge-manage`; public slug routes remain under `/{locale}/knowledge`.

## 4. Active Knowledge Intelligence resources (28 endpoints)

All rows below are implemented. The frontend covers every listed capability. The dedicated authority ranking contract is the one route not called directly: the quality workspace uses `metrics/workspace/top/authority`, which returns the same ranking capability with node labels.

### Graph traversal and reasoning (9)

- `GET /knowledge-intelligence/graph/shortest-path/:sourceId/:targetId`
- `GET /knowledge-intelligence/graph/neighbors/:nodeId`
- `GET /knowledge-intelligence/graph/subgraph?nodeIds=`
- `GET /knowledge-intelligence/graph/ancestors/:nodeId`
- `GET /knowledge-intelligence/graph/descendants/:nodeId`
- `GET /knowledge-intelligence/graph/provenance/:nodeId`
- `GET /knowledge-intelligence/graph/dependencies/:nodeId`
- `GET /knowledge-intelligence/graph/conflicts/:nodeId`
- `GET /knowledge-intelligence/graph/connected-components`

### Metrics and quality (7)

- `GET /knowledge-intelligence/metrics/:nodeId`
- `POST /knowledge-intelligence/metrics/:nodeId/access`
- `GET /knowledge-intelligence/metrics/workspace/top/:metric`
- `GET /knowledge-intelligence/metrics/workspace/authority`
- `GET /knowledge-intelligence/metrics/workspace/completeness`
- `GET /knowledge-intelligence/metrics/workspace/freshness`
- `POST /knowledge-intelligence/metrics/workspace/confidence/recompute`

Contract notes:

- completeness is `{ average, nodes, completeNodes, incompleteNodes }`;
- freshness entries are `{ nodeId, stale, daysSinceUpdate }`;
- both workspace quality GETs are read-only calculations and do not persist derived metrics under `knowledge.read`;
- provenance is `{ nodeId, provenance: [{ step, nodeId, source, evidence }] }`.

### Search and related discovery (2)

- `GET /knowledge-intelligence/search/graph`
- `GET /knowledge-intelligence/search/related/:nodeId`

Graph search is a bounded graph-native heuristic, not the target FTS/vector hybrid: it text-filters up to 100 recent workspace nodes across labels, entity fields, types, and scalar properties, then ranks matches using bounded text relevance, neighbor count, citation count, and persisted composite metrics. It never returns unrelated nodes merely because they have default metrics, and returned ranking scores stay in `[0, 1]`. PostgreSQL FTS, Qdrant, and `HybridSearchService` remain unwired.

### Citations (2)

- `GET /knowledge-intelligence/citations/graph`
- `GET /knowledge-intelligence/citations/expand/:nodeId`

### Clusters and duplicates (3)

- `POST /knowledge-intelligence/clusters/compute`
- `GET /knowledge-intelligence/clusters`
- `GET /knowledge-intelligence/duplicates/:nodeId`

A cluster serializes as `{ id, workspaceId, name, description, nodeIds, properties, createdAt, updatedAt }`. Computed `algorithm` and `threshold` values are inside `properties`; cohesion and centroid fields are not part of this runtime contract.

### Ontology and domain taxonomy (5)

- `GET /knowledge-intelligence/ontologies`
- `POST /knowledge-intelligence/ontologies`
- `GET /knowledge-intelligence/ontologies/:ontologyId/classes`
- `GET /knowledge-intelligence/taxonomy/hierarchy`
- `POST /knowledge-intelligence/taxonomy/classify/:nodeId`

Ontology responses do not expose a `namespace`. Classes expose parent, properties, sort order, abstract status, and timestamps, but no `restrictions` property. Classification metadata is persisted in `graphNode.properties.taxonomyClasses`; it is not represented as an edge to a class URI because graph-edge endpoints must be graph-node UUIDs.

## 5. Dormant Knowledge Factory resources (12 routes)

These route declarations exist in source but are **not registered at runtime**, because `KnowledgeFactoryModule` is not imported by `ApiModule`.

| Routes                                               | Source status                                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `POST /knowledge-factory/documents/upload`           | Has intake implementation, but cannot be used through the active API                 |
| `GET /knowledge-factory/documents/:id`               | **Stub:** echoes ID/workspace only                                                   |
| `GET /knowledge-factory/documents`                   | **Stub:** always returns an empty list                                               |
| `DELETE /knowledge-factory/documents/:id`            | Service-backed but dormant                                                           |
| `POST /knowledge-factory/documents/:id/process`      | Pipeline-backed, unsafe to activate as-is                                            |
| `POST /knowledge-factory/documents/:id/publish`      | Publishing call exists, but its end-to-end pipeline is not production-ready          |
| `GET /knowledge-factory/pipeline/status/:documentId` | Service-backed but dormant                                                           |
| `POST /knowledge-factory/pipeline/:documentId/retry` | Service-backed but dormant                                                           |
| `GET /knowledge-factory/pipeline/runs/:documentId`   | Repository-backed but dormant; uses a third permission convention                    |
| `GET /knowledge-factory/search/documents`            | Search implementation exists but depends on processed data from the dormant pipeline |
| `GET /knowledge-factory/search/suggestions`          | Same dependency                                                                      |
| `GET /knowledge-factory/search/analytics`            | **Synthetic/incomplete:** derives dimensions from at most one search result          |

Activation blockers found in source:

1. Redis/BullMQ queues are manually constructed in `pipeline-event-bus.ts` rather than consistently configured through a working Nest queue registration.
2. `BasePipelineWorker` is decorated with an empty queue name.
3. Core document list/detail controllers are stubs.
4. Permissions are inconsistent and workspace isolation is not equivalent to the active Knowledge controllers.
5. Pipeline/publishing behaviors and analytics cannot be represented as proven end-to-end functionality.
6. The claimed document event flow is therefore architecture intent, not a currently usable HTTP workflow.

The management UI intentionally contains no Factory upload/status/publish controls. An empty Factory UI would incorrectly imply active, empty workspace data; the correct state is “feature unavailable because its module is dormant.”

## 6. Semantic lifecycle integration

The active event registry contains 14 versioned contracts. Four handlers are registered: two consume dormant Factory `DocumentPublished` events, while `KnowledgeArticlePublishedHandler` and `KnowledgeArticleArchivedHandler` consume active CMS lifecycle events. Publishing or republishing an article creates or updates its workspace-bound graph projection and four metrics. Archiving transactionally deletes only the workspace-scoped projection: citations are removed explicitly, while graph edges and metrics cascade with node deletion.

Reliability must be described precisely:

- the article mutation completes before a separate outbox insert, so source data and event enqueue are not atomic;
- the relay polls pending rows every five seconds and retries relay-level exceptions up to three attempts without exponential backoff;
- completed handlers use `event_process_log` to avoid repeating work for the same event ID;
- `SemanticEventBus` catches handler exceptions, allowing the relay to mark the row delivered even when an individual handler failed;
- subscriptions are process-local and there is no dead-letter administration surface.

The current runtime therefore provides persistent outbox enqueue and handler idempotency support, not strict exactly-once or guaranteed end-to-end delivery. Detailed flows are in `event-topology.md` and `semantic-integration-implementation.md`.

## 7. Documentation corrections applied

| Previous/document-intent claim                                                                              | Runtime finding                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Previous `PROJECT_BOOTSTRAP.md`: Knowledge Factory “✅ Complete”                                            | Incorrect as an operational status. The module is dormant, two document endpoints are stubs, queue/worker setup has blockers, and analytics are synthetic. |
| Factory architecture presents upload → classify → parse → chunk → embed → publish as a functioning pipeline | Treat as target architecture. Route and class presence does not establish active end-to-end behavior.                                                      |
| Original Semantic Integration report says phase K2 is complete and connects Factory                         | Event/outbox infrastructure exists, but Factory is not registered; this does not make the document ingestion workflow active.                              |
| Previous Bootstrap wording calls Knowledge Intelligence “Graph CRUD”                                        | The 28 active routes are read/reasoning/metrics/cluster/ontology operations; there is no generic graph-node/edge CRUD controller in this module.           |
| Previous Bootstrap wording implies Factory as a runtime dependency of Intelligence                          | Intelligence is active without importing Factory. Current HTTP operation does not require an active Factory module.                                        |

The cited architecture and bootstrap files now carry runtime qualifications, but this audit remains the route/resource inventory. When implementation and this file disagree, re-audit controller, DTO, service, repository, guard, and module-registration source before changing the status.

## 8. Empty, unavailable, and error semantics in the Web UI

- **Empty:** request succeeded and the active workspace has no matching resource.
- **Unavailable/dormant:** no request should be made (Knowledge Factory).
- **Error:** request failed; display retry and the API/network message rather than an empty-state illustration.
- **Permission denied:** an API error, not empty data.
- **No graph node for an article:** active CMS data and Intelligence graph data have different lifecycles; do not fabricate a graph node in the frontend.

## 9. Validation evidence

Validation completed against the audited source on 2026-08-19:

- 20 exact-path Knowledge CMS, Intelligence, repository, guard, DTO, graph-search, and lifecycle-handler Jest suites passed (222 tests);
- API ESLint passed with no errors and nine warnings in unrelated pre-existing Factory, Project, and Storage files;
- Web TypeScript checking and ESLint passed;
- the optimized Web production build passed and emitted `/{locale}/knowledge-manage` plus its create, detail, and edit routes;
- every changed file passed Prettier checking and `git diff --check` passed. The repository-wide Prettier check still reports 67 unrelated baseline files outside this Knowledge-only change.

Full local API typecheck/build and authenticated browser/API interaction were not certified in this environment. The native Prisma engine required to generate/build `@xennic/database` could not be retrieved because the sandbox could not establish TLS to the Prisma binary hosts. Runtime database behavior and responsive visual behavior therefore still require environment-backed validation before merge.
