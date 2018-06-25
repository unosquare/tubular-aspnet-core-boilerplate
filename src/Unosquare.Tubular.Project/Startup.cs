namespace Unosquare.Tubular.Project
{
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Logging;
    using Microsoft.IdentityModel.Tokens;
    using Newtonsoft.Json.Serialization;
    using System;
    using System.Security.Claims;
    using System.Text;
    using System.Threading.Tasks;
    using Unosquare.Swan.AspNetCore;

    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();

            Configuration = builder.Build();

            tokenOptions = new TokenValidationParameters
            {
                // The signing key must match!
                ValidateIssuerSigningKey = true,
                // Replace with a valid key
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes("ZZZZZZZZZZZZZZZZZZZZZZZZ")),

                // Validate the JWT Issuer (iss) claim
                ValidateIssuer = true,
                ValidIssuer = "ExampleIssuer",

                // Validate the JWT Audience (aud) claim
                ValidateAudience = true,
                ValidAudience = "ExampleAudience",

                // Validate the token expiry
                ValidateLifetime = true,

                // If you want to allow a certain amount of clock drift, set that here:
                ClockSkew = TimeSpan.Zero
            };
        }

        public IConfigurationRoot Configuration { get; }
        private TokenValidationParameters tokenOptions { get; set; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // Add framework services.
            services.AddBearerTokenAuthentication(tokenOptions);

            services.AddCors();
            services.AddMvc()
                .AddJsonOptions(options => options.SerializerSettings.ContractResolver = new DefaultContractResolver());
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            // Route all unknown requests to app root
            app.UseFallback("/index.html");

            app.UseJsonExceptionHandler();

            app.UseDefaultFiles();

            app.UseBearerTokenAuthentication(tokenOptions, (username, password, granType, clientId) =>
            {
                // TODO: Replace with your implementation
                var isLogged = (username == "Admin" && password == "pass.word");
                if (!isLogged)
                {
                    return Task.FromResult<ClaimsIdentity>(null);
                }

                var identity = new ClaimsIdentity();
                identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, username));
                return Task.FromResult(identity);
            });

            app.UseCors(builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
            app.UseMvc();
            app.UseStaticFiles();
        }
    }
}