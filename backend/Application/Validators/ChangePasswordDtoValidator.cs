using FluentValidation;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Validators;

public class ChangePasswordDtoValidator : AbstractValidator<ChangePasswordDto>
{
    public ChangePasswordDtoValidator()
    {
        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("Current password is required");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("New password is required")
            .MinimumLength(6).WithMessage("New password must be at least 6 characters long")
            .Matches(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)").WithMessage("New password must contain at least one lowercase letter, one uppercase letter, and one number");

        RuleFor(x => x.ConfirmNewPassword)
            .NotEmpty().WithMessage("Confirm new password is required")
            .Equal(x => x.NewPassword).WithMessage("Confirm new password must match new password");
    }
}
