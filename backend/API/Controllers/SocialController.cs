using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;
using InvestorManagementSystem.API.Services;

namespace InvestorManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SocialController : ControllerBase
{
    private readonly ISocialService _socialService;
    private readonly ISocialBroadcastService _broadcastService;
    private readonly ILogger<SocialController> _logger;

    public SocialController(
        ISocialService socialService,
        ISocialBroadcastService broadcastService,
        ILogger<SocialController> logger)
    {
        _socialService = socialService;
        _broadcastService = broadcastService;
        _logger = logger;
    }

    // User Profile Management

    [HttpGet("profile/me")]
    public async Task<ActionResult<UserProfileDto>> GetMyProfile()
    {
        try
        {
            var investorId = GetCurrentInvestorId();
            var profile = await _socialService.GetProfileByInvestorIdAsync(investorId);

            if (profile == null)
                return NotFound(new { error = "Profile not found" });

            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user profile");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("profile/{userId}")]
    public async Task<ActionResult<UserProfileDto>> GetProfile(Guid userId)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            var profile = await _socialService.GetProfileAsync(userId, currentUserId);

            if (profile == null)
                return NotFound(new { error = "Profile not found or not accessible" });

            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting profile for user {UserId}", userId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("profile/username/{username}")]
    public async Task<ActionResult<UserProfileDto>> GetProfileByUsername(string username)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            var profile = await _socialService.GetProfileByUsernameAsync(username, currentUserId);

            if (profile == null)
                return NotFound(new { error = "Profile not found or not accessible" });

            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting profile by username {Username}", username);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("profile")]
    public async Task<ActionResult<UserProfileDto>> CreateProfile([FromBody] CreateUserProfileDto dto)
    {
        try
        {
            var investorId = GetCurrentInvestorId();
            var profile = await _socialService.CreateProfileAsync(investorId, dto);

            if (profile == null)
                return BadRequest(new { error = "Profile already exists or username is taken" });

            return CreatedAtAction(nameof(GetMyProfile), profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating profile");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPut("profile")]
    public async Task<ActionResult<UserProfileDto>> UpdateProfile([FromBody] UpdateUserProfileDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var profile = await _socialService.UpdateProfileAsync(userId, dto);

            if (profile == null)
                return NotFound(new { error = "Profile not found" });

            // Broadcast profile update to friends
            var eventDto = new ProfileUpdatedEventDto
            {
                UserId = userId,
                DisplayName = dto.DisplayName,
                AvatarUrl = profile.AvatarUrl,
                UpdatedAt = DateTime.UtcNow
            };
            await _broadcastService.BroadcastProfileUpdate(userId, eventDto);

            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating profile");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("profile/avatar")]
    public async Task<IActionResult> UploadAvatar([FromBody] UploadAvatarDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _socialService.UploadAvatarAsync(userId, dto);

            if (!success)
                return NotFound(new { error = "Profile not found" });

            // Broadcast avatar update to friends
            var eventDto = new ProfileUpdatedEventDto
            {
                UserId = userId,
                AvatarUrl = dto.AvatarUrl,
                UpdatedAt = DateTime.UtcNow
            };
            await _broadcastService.BroadcastProfileUpdate(userId, eventDto);

            return Ok(new { message = "Avatar uploaded successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading avatar");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("profile/cover")]
    public async Task<IActionResult> UploadCoverImage([FromBody] UploadCoverImageDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _socialService.UploadCoverImageAsync(userId, dto);

            if (!success)
                return NotFound(new { error = "Profile not found" });

            return Ok(new { message = "Cover image uploaded successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading cover image");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPut("profile/online-status")]
    public async Task<IActionResult> UpdateOnlineStatus([FromBody] UpdateOnlineStatusDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _socialService.UpdateOnlineStatusAsync(userId, dto.Status);

            if (!success)
                return NotFound(new { error = "Profile not found" });

            // Broadcast handled by SignalR Hub automatically
            return Ok(new { message = "Online status updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating online status");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("search")]
    public async Task<ActionResult<PagedResultDto<UserSearchResultDto>>> SearchUsers([FromQuery] UserSearchDto searchDto)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            var results = await _socialService.SearchUsersAsync(currentUserId, searchDto);

            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching users");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    // Friend Request Management

    [HttpPost("requests")]
    public async Task<ActionResult<FriendRequestDto>> SendFriendRequest([FromBody] SendFriendRequestDto dto)
    {
        try
        {
            var requesterId = GetCurrentUserId();
            var request = await _socialService.SendFriendRequestAsync(requesterId, dto);

            if (request == null)
                return BadRequest(new { error = "Cannot send friend request" });

            // Broadcast to recipient
            var eventDto = new FriendRequestReceivedEventDto
            {
                RequestId = request.Id,
                RequesterId = requesterId,
                RequesterUsername = request.RequesterUsername,
                RequesterDisplayName = request.RequesterDisplayName,
                RequesterAvatarUrl = request.RequesterAvatarUrl,
                Message = request.Message,
                CreatedAt = request.CreatedAt
            };
            await _broadcastService.BroadcastFriendRequestReceived(dto.RecipientId, eventDto);

            return CreatedAtAction(nameof(GetReceivedRequests), request);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending friend request");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("requests/received")]
    public async Task<ActionResult<PagedResultDto<FriendRequestDto>>> GetReceivedRequests([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var userId = GetCurrentUserId();
            var pagination = new PaginationDto { Page = page, PageSize = pageSize };
            var requests = await _socialService.GetReceivedRequestsAsync(userId, pagination);

            return Ok(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting received requests");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("requests/sent")]
    public async Task<ActionResult<PagedResultDto<FriendRequestDto>>> GetSentRequests([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var userId = GetCurrentUserId();
            var pagination = new PaginationDto { Page = page, PageSize = pageSize };
            var requests = await _socialService.GetSentRequestsAsync(userId, pagination);

            return Ok(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting sent requests");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("requests/{requestId}/accept")]
    public async Task<IActionResult> AcceptFriendRequest(Guid requestId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _socialService.AcceptFriendRequestAsync(userId, requestId);

            if (!success)
                return BadRequest(new { error = "Cannot accept friend request" });

            // Get request details to broadcast
            var profile = await _socialService.GetProfileAsync(userId);
            if (profile != null)
            {
                var eventDto = new FriendRequestAcceptedEventDto
                {
                    FriendshipId = requestId,
                    UserId = userId,
                    Username = profile.Username ?? "",
                    DisplayName = profile.DisplayName ?? "",
                    AvatarUrl = profile.AvatarUrl,
                    AcceptedAt = DateTime.UtcNow
                };
                // Broadcast to requester (need to get requester ID from request)
                // This would require fetching the request first
            }

            return Ok(new { message = "Friend request accepted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error accepting friend request {RequestId}", requestId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("requests/{requestId}/decline")]
    public async Task<IActionResult> DeclineFriendRequest(Guid requestId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _socialService.DeclineFriendRequestAsync(userId, requestId);

            if (!success)
                return BadRequest(new { error = "Cannot decline friend request" });

            // Broadcast to requester
            var eventDto = new FriendRequestDeclinedEventDto
            {
                RequestId = requestId,
                UserId = userId,
                DeclinedAt = DateTime.UtcNow
            };
            // Would need requester ID to broadcast

            return Ok(new { message = "Friend request declined successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error declining friend request {RequestId}", requestId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpDelete("requests/{requestId}")]
    public async Task<IActionResult> CancelFriendRequest(Guid requestId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _socialService.CancelFriendRequestAsync(userId, requestId);

            if (!success)
                return BadRequest(new { error = "Cannot cancel friend request" });

            // Would need recipient ID to broadcast cancellation

            return Ok(new { message = "Friend request cancelled successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling friend request {RequestId}", requestId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    // Friend Management

    [HttpGet("friends")]
    public async Task<ActionResult<PagedResultDto<FriendDto>>> GetFriends([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        try
        {
            var userId = GetCurrentUserId();
            var pagination = new PaginationDto { Page = page, PageSize = pageSize };
            var friends = await _socialService.GetFriendsAsync(userId, pagination);

            return Ok(friends);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting friends");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpDelete("friends/{friendId}")]
    public async Task<IActionResult> Unfriend(Guid friendId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _socialService.UnfriendAsync(userId, friendId);

            if (!success)
                return BadRequest(new { error = "Cannot unfriend user" });

            // Broadcast to both users
            var eventDto = new FriendRemovedEventDto
            {
                FriendshipId = Guid.NewGuid(),
                UserId = userId,
                RemovedAt = DateTime.UtcNow
            };
            await _broadcastService.BroadcastFriendRemoved(friendId, eventDto);

            return Ok(new { message = "User unfriended successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unfriending user {FriendId}", friendId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("friends/mutual/{userId}")]
    public async Task<ActionResult<MutualFriendsDto>> GetMutualFriends(Guid userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            var pagination = new PaginationDto { Page = page, PageSize = pageSize };
            var mutualFriends = await _socialService.GetMutualFriendsAsync(currentUserId, userId, pagination);

            return Ok(mutualFriends);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting mutual friends with user {UserId}", userId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("relationship/{userId}")]
    public async Task<ActionResult<RelationshipStatusDto>> GetRelationshipStatus(Guid userId)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            var status = await _socialService.GetRelationshipStatusAsync(currentUserId, userId);

            return Ok(new RelationshipStatusDto { UserId = userId, Status = status });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting relationship status with user {UserId}", userId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    // Friend Suggestions

    [HttpGet("suggestions")]
    public async Task<ActionResult<PagedResultDto<FriendSuggestionDto>>> GetSuggestions([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var userId = GetCurrentUserId();
            var pagination = new PaginationDto { Page = page, PageSize = pageSize };
            var suggestions = await _socialService.GetSuggestionsAsync(userId, pagination);

            return Ok(suggestions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting friend suggestions");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("suggestions/{suggestedUserId}/dismiss")]
    public async Task<IActionResult> DismissSuggestion(Guid suggestedUserId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _socialService.DismissSuggestionAsync(userId, suggestedUserId);

            if (!success)
                return BadRequest(new { error = "Cannot dismiss suggestion" });

            return Ok(new { message = "Suggestion dismissed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error dismissing suggestion {SuggestedUserId}", suggestedUserId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("suggestions/refresh")]
    public async Task<IActionResult> RefreshSuggestions()
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _socialService.RefreshSuggestionsAsync(userId);

            if (!success)
                return BadRequest(new { error = "Cannot refresh suggestions" });

            // Broadcast suggestions update
            await _broadcastService.BroadcastFriendSuggestionsUpdate(userId, 0);

            return Ok(new { message = "Suggestions refreshed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing suggestions");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    // Friend List Management

    [HttpGet("lists")]
    public async Task<ActionResult<PagedResultDto<FriendListDto>>> GetFriendLists([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        try
        {
            var userId = GetCurrentUserId();
            var pagination = new PaginationDto { Page = page, PageSize = pageSize };
            var lists = await _socialService.GetFriendListsAsync(userId, pagination);

            return Ok(lists);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting friend lists");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("lists/{listId}")]
    public async Task<ActionResult<FriendListDetailDto>> GetFriendList(Guid listId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var list = await _socialService.GetFriendListAsync(userId, listId);

            if (list == null)
                return NotFound(new { error = "Friend list not found or you are not the owner" });

            return Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting friend list {ListId}", listId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("lists")]
    public async Task<ActionResult<FriendListDto>> CreateFriendList([FromBody] CreateFriendListDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var list = await _socialService.CreateFriendListAsync(userId, dto);

            if (list == null)
                return BadRequest(new { error = "Cannot create friend list" });

            return CreatedAtAction(nameof(GetFriendList), new { listId = list.Id }, list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating friend list");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPut("lists/{listId}")]
    public async Task<ActionResult<FriendListDto>> UpdateFriendList(Guid listId, [FromBody] UpdateFriendListDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var list = await _socialService.UpdateFriendListAsync(userId, listId, dto);

            if (list == null)
                return NotFound(new { error = "Friend list not found or you are not the owner" });

            return Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating friend list {ListId}", listId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpDelete("lists/{listId}")]
    public async Task<IActionResult> DeleteFriendList(Guid listId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _socialService.DeleteFriendListAsync(userId, listId);

            if (!success)
                return NotFound(new { error = "Friend list not found or you are not the owner" });

            return Ok(new { message = "Friend list deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting friend list {ListId}", listId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("lists/{listId}/members")]
    public async Task<IActionResult> AddToFriendList(Guid listId, [FromBody] AddToFriendListDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _socialService.AddToFriendListAsync(userId, listId, dto.FriendId);

            if (!success)
                return BadRequest(new { error = "Cannot add friend to list" });

            return Ok(new { message = "Friend added to list successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding friend to list {ListId}", listId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpDelete("lists/{listId}/members/{friendId}")]
    public async Task<IActionResult> RemoveFromFriendList(Guid listId, Guid friendId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _socialService.RemoveFromFriendListAsync(userId, listId, friendId);

            if (!success)
                return BadRequest(new { error = "Cannot remove friend from list" });

            return Ok(new { message = "Friend removed from list successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing friend from list {ListId}", listId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    // Block Management

    [HttpGet("blocked")]
    public async Task<ActionResult<PagedResultDto<BlockedUserDto>>> GetBlockedUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        try
        {
            var userId = GetCurrentUserId();
            var pagination = new PaginationDto { Page = page, PageSize = pageSize };
            var blockedUsers = await _socialService.GetBlockedUsersAsync(userId, pagination);

            return Ok(blockedUsers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting blocked users");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("block")]
    public async Task<IActionResult> BlockUser([FromBody] BlockUserDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _socialService.BlockUserAsync(userId, dto);

            if (!success)
                return BadRequest(new { error = "Cannot block user" });

            return Ok(new { message = "User blocked successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error blocking user");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpDelete("block/{blockedUserId}")]
    public async Task<IActionResult> UnblockUser(Guid blockedUserId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _socialService.UnblockUserAsync(userId, blockedUserId);

            if (!success)
                return BadRequest(new { error = "Cannot unblock user" });

            return Ok(new { message = "User unblocked successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unblocking user {BlockedUserId}", blockedUserId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("blocked/{userId}/check")]
    public async Task<ActionResult<IsBlockedDto>> IsBlocked(Guid userId)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            var isBlocked = await _socialService.IsBlockedAsync(currentUserId, userId);

            return Ok(new IsBlockedDto { UserId = userId, IsBlocked = isBlocked });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if user {UserId} is blocked", userId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    // Privacy Settings

    [HttpGet("privacy")]
    public async Task<ActionResult<PrivacySettingsDto>> GetPrivacySettings()
    {
        try
        {
            var userId = GetCurrentUserId();
            var settings = await _socialService.GetPrivacySettingsAsync(userId);

            if (settings == null)
                return NotFound(new { error = "Privacy settings not found" });

            return Ok(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting privacy settings");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPut("privacy")]
    public async Task<ActionResult<PrivacySettingsDto>> UpdatePrivacySettings([FromBody] UpdatePrivacySettingsDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var settings = await _socialService.UpdatePrivacySettingsAsync(userId, dto);

            if (settings == null)
                return NotFound(new { error = "Privacy settings not found" });

            return Ok(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating privacy settings");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    // Statistics

    [HttpGet("stats")]
    public async Task<ActionResult<SocialStatsDto>> GetSocialStats()
    {
        try
        {
            var userId = GetCurrentUserId();
            var stats = await _socialService.GetSocialStatsAsync(userId);

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting social stats");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    // Helper Methods

    private Guid GetCurrentUserId()
    {
        var investorId = GetCurrentInvestorId();

        // Look up the UserProfile ID from the Investor ID
        var profile = _socialService.GetProfileByInvestorIdAsync(investorId).GetAwaiter().GetResult();

        if (profile == null)
            throw new UnauthorizedAccessException("User profile not found");

        return profile.Id;
    }

    private Guid GetCurrentInvestorId()
    {
        var userIdClaim = User.FindFirstValue("investor_id");
        if (string.IsNullOrEmpty(userIdClaim))
            throw new UnauthorizedAccessException("User ID not found in token");

        return Guid.Parse(userIdClaim);
    }
}
