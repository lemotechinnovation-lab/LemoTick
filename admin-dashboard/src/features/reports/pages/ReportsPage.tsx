import ModernBarChart from '@/components/charts/ModernBarChart';
import { PageHeader } from '@/components/ui/PageHeader';
import { ContentSection, PageCard, PageContainer, PageGrid, Stack, StatsCard } from '@/components/ui/PageLayoutEnhanced';
import { Calendar, Download, FileText, Filter, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Report {
    id: string;
    title: string;
    type: 'Trading' | 'Financial' | 'Performance' | 'Tax';
    period: string;
    generatedDate: string;
    size: string;
    status: 'Ready' | 'Processing' | 'Failed';
}

function ReportsPage() {
    const [selectedFilter, setSelectedFilter] = useState<string>('all');

    const [reports] = useState<Report[]>([
        {
            id: '1',
            title: 'Monthly Trading Report',
            type: 'Trading',
            period: 'March 2024',
            generatedDate: '2024-04-01',
            size: '2.4 MB',
            status: 'Ready',
        },
        {
            id: '2',
            title: 'Q1 2024 Financial Summary',
            type: 'Financial',
            period: 'Q1 2024',
            generatedDate: '2024-04-05',
            size: '1.8 MB',
            status: 'Ready',
        },
        {
            id: '3',
            title: 'Performance Analytics',
            type: 'Performance',
            period: 'February 2024',
            generatedDate: '2024-03-01',
            size: '3.2 MB',
            status: 'Ready',
        },
        {
            id: '4',
            title: 'Tax Report 2023',
            type: 'Tax',
            period: 'Year 2023',
            generatedDate: '2024-01-15',
            size: '5.1 MB',
            status: 'Ready',
        },
        {
            id: '5',
            title: 'Weekly Trading Summary',
            type: 'Trading',
            period: 'Week 14, 2024',
            generatedDate: '2024-04-08',
            size: '856 KB',
            status: 'Processing',
        },
        {
            id: '6',
            title: 'Annual Performance Review',
            type: 'Performance',
            period: 'Year 2023',
            generatedDate: '2024-01-10',
            size: '4.7 MB',
            status: 'Ready',
        },
    ]);

    const handleDownload = (report: Report) => {
        toast.success(`Downloading ${report.title}`);
    };

    const handleGenerateReport = () => {
        toast.success('Generating new report...');
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Trading': return { bg: 'from-blue-500/10 to-blue-600/5', text: 'text-blue-400', border: 'border-blue-500/30' };
            case 'Financial': return { bg: 'from-green-500/10 to-green-600/5', text: 'text-green-400', border: 'border-green-500/30' };
            case 'Performance': return { bg: 'from-purple-500/10 to-purple-600/5', text: 'text-purple-400', border: 'border-purple-500/30' };
            case 'Tax': return { bg: 'from-yellow-500/10 to-yellow-600/5', text: 'text-yellow-400', border: 'border-yellow-500/30' };
            default: return { bg: 'from-gray-500/10 to-gray-600/5', text: 'text-gray-400', border: 'border-gray-500/30' };
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Ready': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Processing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'Failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const filteredReports = reports.filter(r => {
        if (selectedFilter === 'all') return true;
        return r.type.toLowerCase() === selectedFilter;
    });

    const stats = {
        total: reports.length,
        ready: reports.filter(r => r.status === 'Ready').length,
        processing: reports.filter(r => r.status === 'Processing').length,
        thisMonth: reports.filter(r => r.generatedDate.includes('2024-04')).length,
    };

    // Reports generated per month (last 6 months)
    const reportsPerMonth = [
        { label: 'Nov', value: 8, color: '#2F6BFF' },
        { label: 'Dec', value: 12, color: '#3B82F6' },
        { label: 'Jan', value: 15, color: '#60A5FA' },
        { label: 'Feb', value: 10, color: '#93C5FD' },
        { label: 'Mar', value: 18, color: '#BFDBFE' },
        { label: 'Apr', value: stats.thisMonth, color: '#FFA62B' },
    ];

    return (
        <PageContainer maxWidth="xl">
            <Stack spacing="lg">
                <PageHeader
                    title="REPORTS"
                    description="Download and manage your trading reports"
                    icon={FileText}
                    actions={
                        <button
                            onClick={handleGenerateReport}
                            className="bg-gradient-to-r from-[#2F6BFF] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2F6BFF] text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 text-sm"
                        >
                            <FileText className="w-4 h-4" />
                            Generate Report
                        </button>
                    }
                />

                {/* Stats Cards */}
                <PageGrid cols={4}>
                    <StatsCard
                        icon={<FileText className="w-5 h-5" />}
                        value={stats.total}
                        label="All Reports"
                        iconColor="text-[#2F6BFF]"
                    />
                    <StatsCard
                        icon={<Download className="w-5 h-5" />}
                        value={stats.ready}
                        label="Available"
                        iconColor="text-green-400"
                    />
                    <StatsCard
                        icon={<TrendingUp className="w-5 h-5" />}
                        value={stats.processing}
                        label="In Progress"
                        iconColor="text-yellow-400"
                    />
                    <StatsCard
                        icon={<Calendar className="w-5 h-5" />}
                        value={stats.thisMonth}
                        label="This Month"
                        iconColor="text-purple-400"
                    />
                </PageGrid>

                {/* Reports Generation Chart */}
                <PageCard padding="lg">
                    <h3 className="text-base font-semibold text-white mb-4">Reports Generated (Last 6 Months)</h3>
                    <ModernBarChart
                        data={reportsPerMonth}
                        height={180}
                        showValues={true}
                    />
                </PageCard>

                {/* Filters */}
                <div className="flex items-center gap-2 p-3 bg-[#16124A]/50 border border-[#2F6BFF]/20 rounded-xl">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'trading', 'financial', 'performance', 'tax'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setSelectedFilter(filter)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 ${selectedFilter === filter
                                    ? 'bg-[#2F6BFF] text-white'
                                    : 'bg-[#0B0633] text-gray-400 hover:text-white hover:bg-[#1E1854]'
                                    }`}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reports Cards - 3 COLUMN GRID */}
                <ContentSection title="Available Reports">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                        {filteredReports.map((report) => {
                            const typeColors = getTypeColor(report.type);
                            return (
                                <div
                                    key={report.id}
                                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1347]/90 via-[#16124A]/80 to-[#0B0633]/90 backdrop-blur-xl border border-white/10 hover:border-[#2F6BFF]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#2F6BFF]/20 hover:-translate-y-1"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#2F6BFF]/0 via-[#2F6BFF]/5 to-[#2F6BFF]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                                    <div className="relative p-5">
                                        {/* Header */}
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${typeColors.bg} flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 border ${typeColors.border}`}>
                                                <FileText className={`w-6 h-6 ${typeColors.text}`} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#2F6BFF] transition-colors duration-300 line-clamp-2">
                                                    {report.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold border backdrop-blur-sm bg-${typeColors.bg} ${typeColors.text} ${typeColors.border}`}>
                                                        {report.type.toUpperCase()}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold border backdrop-blur-sm ${getStatusColor(report.status)}`}>
                                                        {report.status.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Metrics */}
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <div className="group/metric relative overflow-hidden p-3 rounded-lg bg-gradient-to-br from-[#2F6BFF]/10 to-[#1E40AF]/5 border border-[#2F6BFF]/20 hover:border-[#2F6BFF]/40 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-[#2F6BFF]/10 rounded-full blur-xl group-hover/metric:bg-[#2F6BFF]/20 transition-all duration-300" />
                                                <div className="relative">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <Calendar className="w-3 h-3 text-[#2F6BFF]" />
                                                        <div className="text-[10px] font-semibold text-gray-400 uppercase">Period</div>
                                                    </div>
                                                    <div className="text-sm font-bold text-white truncate">{report.period}</div>
                                                </div>
                                            </div>

                                            <div className="group/metric relative overflow-hidden p-3 rounded-lg bg-gradient-to-br from-[#8B5CF6]/10 to-[#7C3AED]/5 border border-[#8B5CF6]/20 hover:border-[#8B5CF6]/40 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-[#8B5CF6]/10 rounded-full blur-xl group-hover/metric:bg-[#8B5CF6]/20 transition-all duration-300" />
                                                <div className="relative">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <FileText className="w-3 h-3 text-[#8B5CF6]" />
                                                        <div className="text-[10px] font-semibold text-gray-400 uppercase">Size</div>
                                                    </div>
                                                    <div className="text-sm font-bold text-white truncate">{report.size}</div>
                                                </div>
                                            </div>

                                            <div className="group/metric relative overflow-hidden p-3 rounded-lg bg-gradient-to-br from-[#F59E0B]/10 to-[#D97706]/5 border border-[#F59E0B]/20 hover:border-[#F59E0B]/40 backdrop-blur-sm transition-all duration-300 hover:scale-105 col-span-2">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-[#F59E0B]/10 rounded-full blur-xl group-hover/metric:bg-[#F59E0B]/20 transition-all duration-300" />
                                                <div className="relative">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <Calendar className="w-3 h-3 text-[#F59E0B]" />
                                                        <div className="text-[10px] font-semibold text-gray-400 uppercase">Generated</div>
                                                    </div>
                                                    <div className="text-sm font-bold text-white">{report.generatedDate}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action */}
                                        {report.status === 'Ready' ? (
                                            <button
                                                onClick={() => handleDownload(report)}
                                                className="w-full group/btn relative overflow-hidden px-3 py-2.5 rounded-lg bg-gradient-to-r from-[#2F6BFF] via-[#3B82F6] to-[#2F6BFF] bg-size-200 bg-pos-0 hover:bg-pos-100 text-white transition-all duration-500 shadow-lg shadow-[#2F6BFF]/30 hover:shadow-xl hover:shadow-[#2F6BFF]/50 text-xs font-bold hover:scale-[1.02]"
                                            >
                                                <span className="relative flex items-center justify-center gap-1.5">
                                                    <Download className="w-3.5 h-3.5" />
                                                    Download Report
                                                </span>
                                            </button>
                                        ) : (
                                            <div className="w-full px-3 py-2.5 rounded-lg bg-[#16124A]/50 border border-yellow-500/30 text-yellow-400 text-xs font-bold text-center">
                                                {report.status === 'Processing' ? '⏳ Processing...' : '❌ Failed'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ContentSection>
            </Stack>
        </PageContainer>
    );
}

export default ReportsPage;
