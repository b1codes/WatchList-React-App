FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy solution and project files to restore dependencies
COPY *.sln .
COPY src/WatchListApi/WatchListApi.csproj src/WatchListApi/
RUN dotnet restore

# Copy the rest of the files and build the app
COPY src/WatchListApi/. src/WatchListApi/
WORKDIR /app/src/WatchListApi
RUN dotnet publish -c Release -o /out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /out ./

# Cloud Run expects the app to listen on the port defined by the PORT environment variable
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "WatchListApi.dll"]
