# 1. Navigate to the API project
cd C:\Users\leonardm\source\innovations\LemoTick\backend\API

# 2. Install EF tools (if not already installed)
dotnet tool install --global dotnet-ef

# 3. Add migration (if you need to create a new one)
dotnet ef migrations add InitialCreate

# 4. Update database
dotnet ef database update

# 5. Verify the database was created
dotnet ef database update --verbose