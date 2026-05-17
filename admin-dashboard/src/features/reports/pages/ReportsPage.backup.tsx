import ModernBarChart from '@/components/charts/ModernBarChart';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageCard, PageContainer, PageGrid, Stack, StatsCard } from '@/components/ui/PageLayoutEnhanced';
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
    ]);

    const handleDownload = (report: Report) => {
        toast.success(`Downloading ${report.title}`);
    };

    const handleGenerateReport = () => {
        toast.success('Generating new report...');
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Trading': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'Financial': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Performance': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'Tax': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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
                            className="bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 text-sm"
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
                        label="Generated"
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

                {/* Reports List */}
                <Stack spacing="md">
                    {filteredReports.map((report) => (
                        <div
                            key={report.id}
                            className="p-4 rounded-xl bg-[#16124A]/50 border border-[#2F6BFF]/20 hover:border-[#2F6BFF] transition-all duration-300 hover:transform hover:scale-[1.01]"
                        >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center shrink-0">
                                        <FileText className="w-5 h-5 text-[#2F6BFF]" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <h3 className="text-base font-semibold text-white">{report.title}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getTypeColor(report.type)}`}>
                                                {report.type}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(report.status)}`}>
                                                {report.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {report.period}
                                            </span>
                                            <span>•</span>
                                            <span>Generated: {report.generatedDate}</span>
                                            <span>•</span>
                                            <span>{report.size}</span>
                                        </div>
                                    </div>
                                </div>
                                {report.status === 'Ready' && (
                                    <button
                                        onClick={() => handleDownload(report)}
                                        className="px-4 py-2 bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 text-sm"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </Stack>
            </Stack>
        </PageContainer>
    );
}

export default ReportsPage;


