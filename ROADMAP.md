# Roadmap and Change Milestones

Date: 2026-02-04

## Vision
- Preserve the strong aspect of visual object mapping.
- Enable inserting already-created concrete objects onto the canvas.
- Visualize views and allow click-through into an object, where another graph is displayed.
- Display bottom navigation (breadcrumb) of nodes up to the root for quick return.
- Separate a comfortable page for data editing and object definition, which are then used on the canvas.
- Fix object connection/linking (currently works only top-down).

## Main Changes (Scope)
- New page for object management (catalog, creation, editing).
- Extension of the canvas/graph to work with existing objects.
- Drill-down views: clicking an object opens a detail view with another graph.
- Breadcrumb navigation of nodes up to the root.
- Stable, bidirectional object linking (both visual and data-level).

## Milestones

### M1: Requirements and Data Model Refinement
- Agree on object types, required metadata, identifiers, and relationships.
- Define what a “view” is and how it maps to a graph.
- Output: concise specification of the data model and flows.

### M2: Object Management Page (Catalog)
- CRUD for concrete objects.
- Validation and basic search/filtering.
- Output: a usable object catalog for insertion onto the canvas.

### M3: Canvas – Inserting Existing Objects
- UI for selecting an object from the catalog and placing it on the canvas.
- Persistence of object positions/layout.
- Output: objects from the catalog can be placed and persisted in the graph.

### M4: Drill-Down Views + Breadcrumbs
- Clicking an object opens a detailed graph for that object.
- Bottom navigation (breadcrumb) showing the path to the root.
- Output: smooth navigation between levels of detail.

### M5: Fix Object Linking
- Linking in all directions (not only top-down).
- Consistency between visual representation and data relationships.
- Output: stable, predictable object linking in the graph.

### M6: Stabilization and UX Polish
- Flow validation, empty states, error handling.
- Performance (larger graphs), layout persistence.
- Output: ready for production use.

## Acceptance Criteria (Selected)
- An object created in the catalog can be searched and inserted onto the canvas.
- Clicking an object opens a detail view with its own graph.
- Breadcrumb always shows the path to the root and allows navigation back.
- Object connections work in any direction and are persisted.

## Risks and Open Questions
- Definition of a “view” and its relationship to objects and graphs.
- Which relationships are allowed (directions, types, constraints).
- Performance for large graphs and layout/storage requirements.

## Estimated Work Order
1. M1: Specification and model
2. M2: Object catalog
3. M3: Inserting objects onto the canvas
4. M4: Drill-down views and breadcrumbs
5. M5: Object linking
6. M6: Stabilization and UX
