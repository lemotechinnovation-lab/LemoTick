using AutoMapper;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Investor mappings
        CreateMap<Investor, InvestorDto>();
        CreateMap<CreateInvestorDto, Investor>();
        CreateMap<UpdateInvestorDto, Investor>();

        // Portfolio mappings
        CreateMap<Portfolio, PortfolioDto>();
        CreateMap<CreatePortfolioDto, Portfolio>();
        CreateMap<UpdatePortfolioDto, Portfolio>();

        // Trade mappings
        CreateMap<Trade, TradeDto>();
        CreateMap<CreateTradeDto, Trade>();
        CreateMap<UpdateTradeDto, Trade>();

        // Transaction mappings
        CreateMap<Transaction, TransactionDto>();
        CreateMap<CreateTransactionDto, Transaction>();
        CreateMap<UpdateTransactionDto, Transaction>();

        // PerformanceMetric mappings
        CreateMap<PerformanceMetric, PerformanceMetricDto>();
        CreateMap<CreatePerformanceMetricDto, PerformanceMetric>();

        // Notification mappings
        CreateMap<Notification, NotificationDto>();
        CreateMap<CreateNotificationDto, Notification>();
    }
}
