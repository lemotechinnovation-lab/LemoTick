using Xunit;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Tests.UnitTests;

public class InvestorTests
{
    [Fact]
    public void Investor_ShouldCreateWithValidData()
    {
        // Arrange
        var firstName = "John";
        var lastName = "Doe";
        var email = "john.doe@example.com";
        var dateOfBirth = new DateTime(1990, 1, 1);
        var nationality = "South African";
        var idNumber = "9001011234567";

        // Act
        var investor = new Investor
        {
            Id = Guid.NewGuid(),
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            DateOfBirth = dateOfBirth,
            Nationality = nationality,
            IdNumber = idNumber,
            Status = InvestorStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        Assert.Equal(firstName, investor.FirstName);
        Assert.Equal(lastName, investor.LastName);
        Assert.Equal(email, investor.Email);
        Assert.Equal(dateOfBirth, investor.DateOfBirth);
        Assert.Equal(nationality, investor.Nationality);
        Assert.Equal(idNumber, investor.IdNumber);
        Assert.Equal(InvestorStatus.Pending, investor.Status);
    }
}
