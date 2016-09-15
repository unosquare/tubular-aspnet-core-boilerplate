using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Unosquare.Tubular.ObjectModel;
using Unosquare.Tubular.Project.Models;

namespace Unosquare.Tubular.Project.Controllers
{
    [Route("api/[controller]")]
    public class ThingController : Controller
    {
        // This is just a sample, you should use DI and a DbContext instead
        private readonly ThingRepository _repository = new ThingRepository();

        [HttpPost, Route("paged")]
        public IActionResult GetGridData([FromBody] GridDataRequest request)
        {
            return Ok(request.CreateGridDataResponse(_repository.GetData()));
        }

        [HttpPost]
        public IActionResult PostData([FromBody] Thing model)
        {
            _repository.AddItem(model);

            return Ok();
        }

        [HttpPut]
        public IActionResult PutData([FromBody] GridDataUpdateRow<Thing> model)
        {
            var item = _repository.GetData().FirstOrDefault(x => x.Id == model.Old.Id);

            if (item == null)
                return NotFound();

            item.Name = model.New.Name;
            item.Amount = model.New.Amount;
            item.Date = model.New.Date;

            return Ok();
        }

        [HttpGet, Route("select/{id}")]
        public IActionResult Get(int id)
        {
            var item = _repository.GetData().FirstOrDefault(x => x.Id == id);

            if (item == null)
                return NotFound();

            return Ok(item);
        }

        [HttpDelete, Route("{id}")]
        public IActionResult Delete(int id)
        {
            var item = _repository.GetData().FirstOrDefault(x => x.Id == id);

            if (item == null)
                return NotFound();

            _repository.RemoveItem(item);

            return Ok();
        }
    }
}
