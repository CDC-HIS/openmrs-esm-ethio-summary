import { getAsyncLifecycle, defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { dashboardMeta } from './dashboard.meta';
import EthioSummary from './ethio-summary/conditions-summary.component';
import MedicationSummary from './ethio-summary/medications-summary.component';
import PatientHistorySumary from './ethio-summary/patient-history-summary.component';

const moduleName = '@openmrs/esm-ethio-summary';

const options = {
  featureName: 'ethio-summary',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const root = getAsyncLifecycle(() => import('./root.component'), options);
export const ethioSummary = getSyncLifecycle(EthioSummary, options);
export const medicationSummary = getSyncLifecycle(MedicationSummary, options);
export const patientHistorySummary = getSyncLifecycle(PatientHistorySumary, options);

//Care & treatment dashboard link
export const ethioSummaryDashboardLink = getSyncLifecycle(
  createDashboardLink({
    ...dashboardMeta,
    moduleName,
  }),
  options,
);

export const encounterDeleteConfirmationDialog = getAsyncLifecycle(() => import('./utils/Delete-Encounter.modal'), {
  featureName: 'encounters',
  moduleName: '@openmrs/esm-patient-encounters-app',
});
