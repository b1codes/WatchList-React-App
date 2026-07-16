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

# Lambda Web Adapter runs as a Lambda extension, proxying Lambda invocations to
# this app over HTTP on AWS_LWA_PORT (defaults to 8080). It's a no-op outside
# Lambda, so this same image still works on Cloud Run / any other host.
# Check https://gallery.ecr.aws/awsguru/aws-lambda-adapter for newer tags.
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.1 /lambda-adapter /opt/extensions/lambda-adapter

# Cloud Run / Lambda Web Adapter both expect the app to listen on this port
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "WatchListApi.dll"]
