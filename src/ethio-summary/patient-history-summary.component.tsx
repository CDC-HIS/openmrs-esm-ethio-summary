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
  Layer,
  Tile,
} from '@carbon/react';
import { DataTableSkeleton, InlineLoading } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { formatDate, formatDatetime, parseDate, restBaseUrl, useLayoutType } from '@openmrs/esm-framework';
import {
  CardHeader,
  EmptyDataIllustration,
  EmptyState,
  ErrorState,
  launchPatientWorkspace,
} from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import styles from './ethio-summary.scss';
import { useEncounters } from './ethio-summary.resource';
import { FOLLOWUP_ENCOUNTER_TYPE_UUID } from '../constants';
import { getObsFromEncounter } from '../utils/encounter-utils';
import { EncounterActionMenu } from '../utils/encounter-action-menu';
import { fetchPatientData, fetchPatientHistoryData } from '../api/api';

interface HivCareAndTreatmentProps {
  patientUuid: string;
}

const PatientHistorySummary: React.FC<HivCareAndTreatmentProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const headerTitle = 'Patient History';
  const { encounters, isError, isValidating, mutate } = useEncounters(patientUuid, FOLLOWUP_ENCOUNTER_TYPE_UUID);
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';

  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const getPatientData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchPatientHistoryData(patientUuid);
        setPatientData(data); // Transform data as per table structure
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
    { key: 'observation', header: 'Observation' },
    { key: 'value', header: 'Value' },
  ];

  const tableRows = useMemo(() => {
    if (!patientData || !Array.isArray(patientData)) {
      console.warn('Invalid or empty patientData:', patientData);
      return [];
    }

    return patientData.map((item, index) => ({
      id: item.uuid || index,
      observation: item.observation || 'N/A',
      value: item.value || 'N/A',
      //visitDate: item.visitDate ? formatDate(parseDate(item.visitDate), { mode: 'wide' }) : '--',
    }));
  }, [patientData]);

  // Pagination state
  const totalRows = tableRows.length;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentRows = useMemo(
    () => tableRows.slice(indexOfFirstRow, indexOfLastRow),
    [indexOfFirstRow, indexOfLastRow, tableRows],
  );

  const handlePageSizeChange = (newPageSize: number) => {
    setRowsPerPage(newPageSize);
    setCurrentPage(1); // Reset to the first page when the page size changes
  };

  // Function to handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Error handling for loading and error states
  if (isLoading) return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;
  if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;

  return (
    <div className={styles.widgetCard}>
      <div className={styles.header}>
        <div className={styles.visitInfo}>
          <div>
            <h4 className={styles.visitType} title={headerTitle}>
              {t('patientHistory', 'Patient History')}
            </h4>
            <div className={styles.displayFlex}>
              <h6 className={styles.dateLabel}>{t('visitDate', 'Visit Date')}:</h6>
              <span className={styles.date}>
                {patientData.length > 0 && patientData[0].visitDate
                  ? formatDatetime(parseDate(patientData[0].visitDate), { mode: 'wide' })
                  : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
      {currentRows.length > 0 ? (
        <>
          <DataTable rows={currentRows} headers={tableHeaders} useZebraStyles size={isTablet ? 'lg' : 'sm'}>
            {({ rows, headers, getHeaderProps, getTableProps }) => (
              <TableContainer>
                <Table aria-label="Patient Information" {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
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
          {totalRows > rowsPerPage && (
            <Pagination
              backwardText={t('previousPage', 'Previous page')}
              forwardText={t('nextPage', 'Next page')}
              itemsPerPageText={t('itemsPerPage', 'Items per page')}
              page={currentPage}
              pageSize={100}
              pageSizes={[10, 20, 30, 40, 50]}
              totalItems={totalRows}
              onChange={(event) => {
                if (event.pageSize !== rowsPerPage) {
                  handlePageSizeChange(event.pageSize);
                }
                if (event.page !== currentPage) {
                  handlePageChange(event.page);
                }
              }}
            />
          )}
        </>
      ) : (
        <Layer>
          <Tile className={styles.tile}>
            <EmptyDataIllustration />
            <p className={styles.content}>
              {t('noPatientHistory', 'There are no patient history to display for this patient')}
            </p>
          </Tile>
        </Layer>
      )}
    </div>
  );
};

export default PatientHistorySummary;
