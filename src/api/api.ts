import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { encounterRepresentation } from '../constants';

export function saveEncounter(abortController: AbortController, payload, encounterUuid?: string) {
  const url = encounterUuid
    ? `${restBaseUrl}/encounter/${encounterUuid}?v=${encounterRepresentation}`
    : `${restBaseUrl}/encounter?v=${encounterRepresentation}`;

  return openmrsFetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: encounterUuid ? 'POST' : 'POST',
    body: JSON.stringify(payload),
    signal: abortController.signal,
  }).catch((err) => {
    console.error('Error saving encounter:', err);
    throw err;
  });
}

export function fetchLocation() {
  return openmrsFetch(`${restBaseUrl}/location?q=&v=default`);
}

export async function getPatientInfo(patientUuid: string) {
  try {
    const response = await openmrsFetch(`${restBaseUrl}/patient/${patientUuid}?v=full`);
    const data = await response.data;

    return data;
  } catch (error) {
    console.error('Error fetching patient emergency contact:', error);
    return null;
  }
}

export function getPatientEncounters(patientUUID, encounterUUID) {
  //This function fetches the first two encounters for a given patient. You can remove the limit and also the "v=full"
  return openmrsFetch(
    `${restBaseUrl}/encounter?encounterType=${encounterUUID}&patient=${patientUUID}&v=full&limit=5`,
  ).then(({ data }) => {
    return data.results;
  });
}

export function fetchPatientLastEncounter(patientUuid: string, encounterType) {
  const query = `encounterType=${encounterType}&patient=${patientUuid}`;
  return openmrsFetch(`${restBaseUrl}/encounter?${query}&v=${encounterRepresentation}`).then(({ data }) => {
    if (data.results.length) {
      return data.results[data.results.length - 1];
    }

    return null;
  });
}

export async function fetchPatientData(patientUuid: string) {
  try {
    const response = await openmrsFetch(`${restBaseUrl}/patientcondition/${patientUuid}`);
    const data = await response.data;

    return data.map((detail: any) => ({
      id: detail.id,
      uuid: detail.uuid,
      // currentRegimenInitiatedDate: data.currentRegimenInitiatedDate,
      // regimen: data.regimen,
      // resourceVersion: data.resourceVersion,
      name: detail.name,
      onSetDate: detail.onSetDate,
      status: 'Active'
    }));
  } catch (error) {
    console.error('Error fetching patient data:', error);
    return null;
  }
}

