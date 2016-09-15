using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Unosquare.Tubular.Project.Models
{
    /// <summary>
    /// Just a simple model
    /// </summary>
    public class Thing
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public decimal Amount { get; set; }

        public DateTime Date { get; set; }
    }

    /// <summary>
    /// Sample Repository to store Things
    /// </summary>
    public class ThingRepository
    {
        public static List<Thing> Data = new List<Thing>();

        public ThingRepository()
        {
            if (Data.Count > 0) return;

            for (var i = 0; i < 100; i++)
            {
                AddItem(new Thing
                {
                    Id = i,
                    Name = "Thing " + i,
                    Amount = 100 * i,
                    Date = DateTime.UtcNow
                });
            }
        }

        public IQueryable<Thing> GetData()
        {
            return Data.AsQueryable();
        }

        public void AddItem(Thing thing)
        {
            thing.Id = Data.Count + 1;
            Data.Add(thing);
        }

        public void RemoveItem(Thing thing)
        {
            Data.Remove(thing);
        }
    }
}
