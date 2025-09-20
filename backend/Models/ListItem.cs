using System;
using System.Collections.Generic;
 
namespace backend.Models
{
    public class ListItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
    }
}