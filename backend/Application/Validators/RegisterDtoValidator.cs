using FluentValidation;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Validators;

public class RegisterDtoValidator : AbstractValidator<RegisterDto>
{
    public RegisterDtoValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .MaximumLength(100).WithMessage("First name cannot exceed 100 characters");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required")
            .MaximumLength(100).WithMessage("Last name cannot exceed 100 characters");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Email must be a valid email address");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters long")
            .Matches(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)").WithMessage("Password must contain at least one lowercase letter, one uppercase letter, and one number");

        RuleFor(x => x.ConfirmPassword)
            .NotEmpty().WithMessage("Confirm password is required")
            .Equal(x => x.Password).WithMessage("Confirm password must match password");

        RuleFor(x => x.PhoneNumber)
            .Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Phone number must be a valid international format")
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber));

        RuleFor(x => x.DateOfBirth)
            .NotEmpty().WithMessage("Date of birth is required")
            .LessThan(DateTime.Today.AddYears(-18)).WithMessage("Must be at least 18 years old")
            .GreaterThan(DateTime.Today.AddYears(-100)).WithMessage("Date of birth is invalid");

        RuleFor(x => x.Nationality)
            .NotEmpty().WithMessage("Nationality is required")
            .MaximumLength(50).WithMessage("Nationality cannot exceed 50 characters");

        RuleFor(x => x.IdNumber)
            .NotEmpty().WithMessage("ID number is required")
            .MaximumLength(20).WithMessage("ID number cannot exceed 20 characters");
    }
}
