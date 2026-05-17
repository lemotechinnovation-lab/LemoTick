using FluentValidation;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Validators;

// ═══════════════════════════════════════════════════════════════════════════
// User Profile Validators
// ═══════════════════════════════════════════════════════════════════════════

public class CreateUserProfileDtoValidator : AbstractValidator<CreateUserProfileDto>
{
    public CreateUserProfileDtoValidator()
    {
        RuleFor(x => x.Username)
            .MaximumLength(50).WithMessage("Username cannot exceed 50 characters")
            .Matches(@"^[a-zA-Z0-9_-]+$").WithMessage("Username can only contain letters, numbers, underscores, and hyphens")
            .When(x => !string.IsNullOrEmpty(x.Username));

        RuleFor(x => x.DisplayName)
            .MaximumLength(100).WithMessage("Display name cannot exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.DisplayName));

        RuleFor(x => x.Bio)
            .MaximumLength(500).WithMessage("Bio cannot exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Bio));

        RuleFor(x => x.PreferredMarkets)
            .Must(markets => markets == null || markets.Count <= 20)
            .WithMessage("Cannot have more than 20 preferred markets")
            .When(x => x.PreferredMarkets != null);
    }
}

public class UpdateUserProfileDtoValidator : AbstractValidator<UpdateUserProfileDto>
{
    public UpdateUserProfileDtoValidator()
    {
        RuleFor(x => x.DisplayName)
            .MaximumLength(100).WithMessage("Display name cannot exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.DisplayName));

        RuleFor(x => x.Bio)
            .MaximumLength(500).WithMessage("Bio cannot exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Bio));

        RuleFor(x => x.PreferredMarkets)
            .Must(markets => markets == null || markets.Count <= 20)
            .WithMessage("Cannot have more than 20 preferred markets")
            .When(x => x.PreferredMarkets != null);
    }
}

public class UploadAvatarDtoValidator : AbstractValidator<UploadAvatarDto>
{
    public UploadAvatarDtoValidator()
    {
        RuleFor(x => x.AvatarUrl)
            .NotEmpty().WithMessage("Avatar URL is required")
            .MaximumLength(255).WithMessage("Avatar URL cannot exceed 255 characters")
            .Must(BeAValidUrl).WithMessage("Avatar URL must be a valid URL");
    }

    private bool BeAValidUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
            && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}

public class UploadCoverImageDtoValidator : AbstractValidator<UploadCoverImageDto>
{
    public UploadCoverImageDtoValidator()
    {
        RuleFor(x => x.CoverImageUrl)
            .NotEmpty().WithMessage("Cover image URL is required")
            .MaximumLength(255).WithMessage("Cover image URL cannot exceed 255 characters")
            .Must(BeAValidUrl).WithMessage("Cover image URL must be a valid URL");
    }

    private bool BeAValidUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
            && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// Friendship Validators
// ═══════════════════════════════════════════════════════════════════════════

public class SendFriendRequestDtoValidator : AbstractValidator<SendFriendRequestDto>
{
    public SendFriendRequestDtoValidator()
    {
        RuleFor(x => x.RecipientId)
            .NotEmpty().WithMessage("Recipient ID is required");

        RuleFor(x => x.Message)
            .MaximumLength(500).WithMessage("Message cannot exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Message));
    }
}

public class AcceptFriendRequestDtoValidator : AbstractValidator<AcceptFriendRequestDto>
{
    public AcceptFriendRequestDtoValidator()
    {
        RuleFor(x => x.RequestId)
            .NotEmpty().WithMessage("Request ID is required");
    }
}

public class DeclineFriendRequestDtoValidator : AbstractValidator<DeclineFriendRequestDto>
{
    public DeclineFriendRequestDtoValidator()
    {
        RuleFor(x => x.RequestId)
            .NotEmpty().WithMessage("Request ID is required");
    }
}

public class CancelFriendRequestDtoValidator : AbstractValidator<CancelFriendRequestDto>
{
    public CancelFriendRequestDtoValidator()
    {
        RuleFor(x => x.RequestId)
            .NotEmpty().WithMessage("Request ID is required");
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// Friend Validators
// ═══════════════════════════════════════════════════════════════════════════

public class UnfriendDtoValidator : AbstractValidator<UnfriendDto>
{
    public UnfriendDtoValidator()
    {
        RuleFor(x => x.FriendId)
            .NotEmpty().WithMessage("Friend ID is required");
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// Friend List Validators
// ═══════════════════════════════════════════════════════════════════════════

public class CreateFriendListDtoValidator : AbstractValidator<CreateFriendListDto>
{
    public CreateFriendListDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Friend list name is required")
            .MaximumLength(100).WithMessage("Friend list name cannot exceed 100 characters");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description cannot exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Color)
            .MaximumLength(50).WithMessage("Color cannot exceed 50 characters")
            .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$").WithMessage("Color must be a valid hex color code")
            .When(x => !string.IsNullOrEmpty(x.Color));

        RuleFor(x => x.Icon)
            .MaximumLength(50).WithMessage("Icon cannot exceed 50 characters")
            .When(x => !string.IsNullOrEmpty(x.Icon));
    }
}

public class UpdateFriendListDtoValidator : AbstractValidator<UpdateFriendListDto>
{
    public UpdateFriendListDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Friend list name is required")
            .MaximumLength(100).WithMessage("Friend list name cannot exceed 100 characters");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description cannot exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Color)
            .MaximumLength(50).WithMessage("Color cannot exceed 50 characters")
            .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$").WithMessage("Color must be a valid hex color code")
            .When(x => !string.IsNullOrEmpty(x.Color));

        RuleFor(x => x.Icon)
            .MaximumLength(50).WithMessage("Icon cannot exceed 50 characters")
            .When(x => !string.IsNullOrEmpty(x.Icon));
    }
}

public class AddToFriendListDtoValidator : AbstractValidator<AddToFriendListDto>
{
    public AddToFriendListDtoValidator()
    {
        RuleFor(x => x.FriendListId)
            .NotEmpty().WithMessage("Friend list ID is required");

        RuleFor(x => x.FriendId)
            .NotEmpty().WithMessage("Friend ID is required");
    }
}

public class RemoveFromFriendListDtoValidator : AbstractValidator<RemoveFromFriendListDto>
{
    public RemoveFromFriendListDtoValidator()
    {
        RuleFor(x => x.FriendListId)
            .NotEmpty().WithMessage("Friend list ID is required");

        RuleFor(x => x.FriendId)
            .NotEmpty().WithMessage("Friend ID is required");
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// Blocked User Validators
// ═══════════════════════════════════════════════════════════════════════════

public class BlockUserDtoValidator : AbstractValidator<BlockUserDto>
{
    public BlockUserDtoValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(x => x.Reason)
            .MaximumLength(500).WithMessage("Reason cannot exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Reason));
    }
}

public class UnblockUserDtoValidator : AbstractValidator<UnblockUserDto>
{
    public UnblockUserDtoValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// Privacy Settings Validators
// ═══════════════════════════════════════════════════════════════════════════

public class UpdatePrivacySettingsDtoValidator : AbstractValidator<UpdatePrivacySettingsDto>
{
    public UpdatePrivacySettingsDtoValidator()
    {
        // All fields are optional, so no required validations
        // Enum validation is handled by the model binding
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// Search Validators
// ═══════════════════════════════════════════════════════════════════════════

public class UserSearchDtoValidator : AbstractValidator<UserSearchDto>
{
    public UserSearchDtoValidator()
    {
        RuleFor(x => x.Query)
            .MaximumLength(100).WithMessage("Search query cannot exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.Query));

        RuleFor(x => x.MinWinRate)
            .InclusiveBetween(0, 100).WithMessage("Win rate must be between 0 and 100")
            .When(x => x.MinWinRate.HasValue);

        RuleFor(x => x.Page)
            .GreaterThan(0).WithMessage("Page must be greater than 0");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100).WithMessage("Page size must be between 1 and 100");
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// Pagination Validators
// ═══════════════════════════════════════════════════════════════════════════

public class PaginationDtoValidator : AbstractValidator<PaginationDto>
{
    public PaginationDtoValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThan(0).WithMessage("Page must be greater than 0");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100).WithMessage("Page size must be between 1 and 100");
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// Suggestion Validators
// ═══════════════════════════════════════════════════════════════════════════

public class DismissSuggestionDtoValidator : AbstractValidator<DismissSuggestionDto>
{
    public DismissSuggestionDtoValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");
    }
}
