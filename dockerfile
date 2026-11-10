# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

# Copy project file
COPY ["WorkSphere.Server/WorkSphere.Server.csproj", "WorkSphere.Server/"]

# Restore dependencies
RUN dotnet restore "WorkSphere.Server/WorkSphere.Server.csproj"

# Copy remaining source code
COPY ["WorkSphere.Server/", "WorkSphere.Server/"]

# Publish application
RUN dotnet publish "WorkSphere.Server/WorkSphere.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false


# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

# Copy published application
COPY --from=build /app/publish .

USER $APP_UID

# Render port
ENV ASPNETCORE_URLS=http://0.0.0.0:10000

EXPOSE 10000

# Start application
ENTRYPOINT ["dotnet", "WorkSphere.Server.dll"]