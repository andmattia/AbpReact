import { useState, useMemo } from 'react';
import { useTenants, QueryNames } from '@abpreact/hooks';

import { useQueryClient } from '@tanstack/react-query';
import {
    PaginationState,
    useReactTable,
    getCoreRowModel,
    ColumnDef
} from '@tanstack/react-table';

import { TenantEdit } from './TenantEdit';
import { FeatureList } from './FeatureList';
import { TenantDto, TenantUpdateDto } from '@abpreact/proxy';
import Loader from '../Shared/Loader';
import Error from '../Shared/Error';
import { useToast } from '../Shared/hooks/useToast';
import { PermissionActions } from '../Permission/PermissionActions';
import { CustomTable } from '../Shared/CustomTable';
import { DeleteTenant } from './DeleteTenant';

export const TenantList = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [tenantActionDialog, setTenantActionDialog] = useState<{
        tenantId: string;
        tenantDto: TenantUpdateDto;
        dialgoType?: 'edit' | 'manage_features' | 'delete';
    } | null>();

    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 1,
        pageSize: 10
    });
    const { isLoading, data, isError } = useTenants(pageIndex, pageSize);
    const pagination = useMemo(
        () => ({
            pageIndex,
            pageSize
        }),
        [pageIndex, pageSize, toast]
    );

    const defaultColumns: ColumnDef<TenantDto>[] = useMemo(
        () => [
            {
                header: 'Tenant Management',
                columns: [
                    {
                        accessorKey: 'name',
                        header: 'Tenant Name',
                        cell: (info) => info.getValue()
                    },
                    {
                        accessorKey: 'actions',
                        header: 'Actions',
                        cell: (info) => {
                            return (
                                <PermissionActions
                                    actions={[
                                        {
                                            icon: 'features',
                                            policy: 'AbpTenantManagement.Tenants.ManageFeatures',
                                            callback: () => {
                                                setTenantActionDialog({
                                                    dialgoType:
                                                        'manage_features',
                                                    tenantId:
                                                        info.row.original.id!,
                                                    tenantDto: info.row
                                                        .original as TenantUpdateDto
                                                });
                                            }
                                        },
                                        {
                                            icon: 'pencil',
                                            policy: 'AbpTenantManagement.Tenants.Update',
                                            callback: () => {
                                                setTenantActionDialog({
                                                    dialgoType: 'edit',
                                                    tenantId:
                                                        info.row.original.id!,
                                                    tenantDto: info.row
                                                        .original as TenantUpdateDto
                                                });
                                            }
                                        },
                                        {
                                            icon: 'trash',
                                            policy: 'AbpTenantManagement.Tenants.Delete',
                                            callback: () => {
                                                setTenantActionDialog({
                                                    tenantId: info.row.original
                                                        .id as string,
                                                    tenantDto: info.row
                                                        .original as TenantUpdateDto,
                                                    dialgoType: 'delete'
                                                });
                                            }
                                        }
                                    ]}
                                />
                            );
                        }
                    }
                ]
            }
        ],
        [tenantActionDialog]
    );

    const table = useReactTable({
        data: data?.items ?? [],
        pageCount: data?.totalCount ?? -1,
        state: {
            pagination
        },
        columns: defaultColumns,
        getCoreRowModel: getCoreRowModel(),
        onPaginationChange: setPagination,
        manualPagination: true
    });

    if (isLoading) return <Loader />;
    if (isError) return <Error />;

    return (
        <>
            {tenantActionDialog?.dialgoType === 'edit' && (
                <TenantEdit
                    tenantDto={tenantActionDialog.tenantDto}
                    tenantId={tenantActionDialog.tenantId}
                    onDismiss={() => {
                        queryClient.invalidateQueries([QueryNames.GetTenants]);
                        setTenantActionDialog(null);
                    }}
                />
            )}
            {tenantActionDialog?.dialgoType === 'delete' && (
                <DeleteTenant
                    tenant={{
                        tenantId: tenantActionDialog.tenantId,
                        tenantName: tenantActionDialog.tenantDto.name
                    }}
                    onDismiss={() => {
                        queryClient.invalidateQueries([QueryNames.GetTenants]);
                        setTenantActionDialog(null);
                    }}
                />
            )}
            {tenantActionDialog?.dialgoType === 'manage_features' && (
                <FeatureList
                    onDismiss={() => setTenantActionDialog(null)}
                    tenantId={tenantActionDialog.tenantId}
                />
            )}
            <CustomTable<TenantDto>
                table={table}
                totalCount={data?.totalCount ?? 0}
                pageSize={pageSize}
            />
        </>
    );
};
