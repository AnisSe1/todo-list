using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ListItemsController : ControllerBase
    {
        private readonly ILogger<ListItemsController> _logger;
        private readonly AppDbContext _context;

        public ListItemsController(ILogger<ListItemsController> logger, AppDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        [HttpGet]
        public ActionResult<IEnumerable<ListItem>> GetItems()
        {
            try
            {
                var items = _context.Items.ToList();
                return Ok(items);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error occurred while fetching items");
                return StatusCode(500, "Internal server error");
            }
           
        }

        [HttpPost]
        public ActionResult<ListItem> CreateListItem(ListItem newItem)
        {
            try
            {
                if (newItem == null || string.IsNullOrWhiteSpace(newItem.Title))
                {
                    return BadRequest("Item title is required");
                }

                // Ensure the ID is reset for new items
                newItem.Id = 0;
                
                _context.Items.Add(newItem);
                _context.SaveChanges();
                
                _logger.LogInformation("Created new item with ID {ItemId}: {Title}", newItem.Id, newItem.Title);
                return CreatedAtAction(nameof(GetItems), new { id = newItem.Id }, newItem);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error occurred while creating item");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteListItem(int id)
        {
            try
            {
                var item = _context.Items.Find(id);
                if (item == null)
                {
                    _logger.LogWarning("Attempt to delete non-existent item with ID {ItemId}", id);
                    return NotFound($"Item with ID {id} not found");
                }

                _context.Items.Remove(item);
                _context.SaveChanges();
                
                _logger.LogInformation("Deleted item with ID {ItemId}: {Title}", id, item.Title);
                return NoContent();
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error occurred while deleting item with ID {ItemId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public ActionResult<ListItem> UpdateListItem(int id, ListItem updatedItem)
        {
            try
            {
                if (updatedItem == null || string.IsNullOrWhiteSpace(updatedItem.Title))
                {
                    return BadRequest("Item title is required");
                }

                var existingItem = _context.Items.Find(id);
                if (existingItem == null)
                {
                    _logger.LogWarning("Attempt to update non-existent item with ID {ItemId}", id);
                    return NotFound($"Item with ID {id} not found");
                }

                // Update the existing item's properties
                existingItem.Title = updatedItem.Title.Trim();
                existingItem.IsCompleted = updatedItem.IsCompleted;

                _context.SaveChanges();
                
                _logger.LogInformation("Updated item with ID {ItemId}: {Title}, IsCompleted: {IsCompleted}", 
                    id, existingItem.Title, existingItem.IsCompleted);
                
                return Ok(existingItem);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error occurred while updating item with ID {ItemId}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}