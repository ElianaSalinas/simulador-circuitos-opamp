import { buildNetlist } from '../frontend/src/simulation/NetlistBuilder';
import { solveMNA } from '../frontend/src/simulation/MNASolver';
import { predefinedCircuits } from '../frontend/src/library/circuits';

for (const c of predefinedCircuits) {
  const { elements, nodeCount, nodeLabels } = buildNetlist(c.data.components, c.data.connections);
  const result = solveMNA(elements, nodeCount, nodeLabels);
  console.log(`Circuit ${c.id}: success=${result.success}`);
  if (!result.success) {
    console.log(`  Error: ${result.error}`);
  }
}
