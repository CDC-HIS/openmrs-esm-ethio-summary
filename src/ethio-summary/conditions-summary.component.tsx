import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Pagination,
} from '@carbon/react';
import { DataTableSkeleton, InlineLoading } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { formatDate, parseDate, restBaseUrl, useLayoutType } from '@openmrs/esm-framework';
import { CardHeader, EmptyState, ErrorState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import styles from './hiv-care-and-treatment.scss';
import { useEncounters } from './ethio-summary.resource';
import { FOLLOWUP_ENCOUNTER_TYPE_UUID } from '../constants';
import { getObsFromEncounter } from '../utils/encounter-utils';
import { EncounterActionMenu } from '../utils/encounter-action-menu';
import { fetchPatientData } from '../api/api';

interface HivCareAndTreatmentProps {
  patientUuid: string;
}

const EthioSummary: React.FC<HivCareAndTreatmentProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const headerTitle = 'Conditions summary';
  const { encounters, isError, isValidating, mutate } = useEncounters(
    patientUuid,
    FOLLOWUP_ENCOUNTER_TYPE_UUID,
  );
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';

  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getPatientData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchPatientData(patientUuid);
        setPatientData(data ? [data] : []); // Transform data as per table structure
      } catch (error) {
        console.error('Error fetching patient emergency contact:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    };

    getPatientData();
  }, [patientUuid]);


  const tableHeaders = [
    { key: 'regimen', header: 'Regimen' },
  { key: 'currentRegimenInitiatedDate', header: 'Initiated Date' },
  { key: 'pregnant', header: 'Pregnant?' },
  ];

  const tableRows = patientData
  ? patientData.map((patient, index) => ({
      id: patient.patientUUID || index,
      regimen: patient.regimen || null,
      currentRegimenInitiatedDate: patient.currentRegimenInitiatedDate
        ? formatDate(parseDate(patient.currentRegimenInitiatedDate), { mode: 'wide' })
        : null,
    }))
  : [];
  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const rowsPerPage = 10;
  const totalRows = tableRows.length;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tableRows.slice(indexOfFirstRow, indexOfLastRow);

  // Error handling for loading and error states
  if (isLoading) return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;
  if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;

  return (
    <div className={styles.widgetCard}>
      <CardHeader title={headerTitle}>
        <span></span>
        
      </CardHeader>
      {currentRows.length > 0 ? (
        <>
          <DataTable rows={currentRows} headers={tableHeaders} useZebraStyles size={isTablet ? 'lg' : 'sm'}>
            {({ rows, headers, getHeaderProps, getTableProps }) => (
              <TableContainer>
                <Table aria-label="Patient Information" {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader {...getHeaderProps({ header })}>
                          {header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
        </>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default EthioSummary;
