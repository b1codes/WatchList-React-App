using WatchListApi.Models;
using WatchListApi.Services;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using WatchListApi.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddMemoryCache();

// Configure TmdbSettings
builder.Services.Configure<TmdbSettings>(builder.Configuration.GetSection("Tmdb"));

// 1. Read configuration
var projectId = builder.Configuration["Firebase:ProjectId"];
var credentialPath = builder.Configuration["Firebase:CredentialPath"];
var credentialJson = builder.Configuration["Firebase:CredentialJson"];

if (string.IsNullOrWhiteSpace(projectId))
{
    throw new InvalidOperationException("Firebase:ProjectId is required.");
}

// 2. Register FirestoreDb as a Singleton.
// Prefer an inline JSON credential (e.g. from a Lambda env var, where the
// filesystem is read-only) over a credential file path used for local dev.
builder.Services.AddSingleton<FirestoreDb>(provider =>
{
    var firestoreBuilder = new FirestoreDbBuilder { ProjectId = projectId };

    if (!string.IsNullOrEmpty(credentialJson))
    {
        firestoreBuilder.GoogleCredential = Google.Apis.Auth.OAuth2.CredentialFactory
            .FromJson<Google.Apis.Auth.OAuth2.ServiceAccountCredential>(credentialJson)
            .ToGoogleCredential();
    }
    else if (!string.IsNullOrEmpty(credentialPath))
    {
        Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", credentialPath);
    }

    return firestoreBuilder.Build();
});

builder.Services.AddHttpClient<ITmdbService, TmdbService>();
builder.Services.AddScoped<WatchListRepository>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://securetoken.google.com/{projectId}";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = $"https://securetoken.google.com/{projectId}",
            ValidateAudience = true,
            ValidAudience = projectId,
            ValidateLifetime = true
        };
    });
builder.Services.AddAuthorization();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:8081")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
