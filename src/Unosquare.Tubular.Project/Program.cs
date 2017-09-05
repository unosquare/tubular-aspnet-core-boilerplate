using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Builder;

namespace Unosquare.Tubular.Project
{
    public class Program
    {
        public static void Main(string[] args)
        {

            var host = BuildWebHost(args);          

            host.Run();
        }

        public static IWebHost BuildWebHost(string[] args) =>
           new WebHostBuilder()
               .UseKestrel()
               .UseContentRoot(Directory.GetCurrentDirectory())
               .UseIISIntegration()
               .UseStartup<Startup>()
               .Build();
    }
}
