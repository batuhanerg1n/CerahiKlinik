using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.DTOs
{
    public class PageResultDto<T>
    {
        public IEnumerable<T> Items { get; set; }= new List<T>();
        public int TotalCount { get; set; }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public int TotalPage => (int)Math.Ceiling((double)TotalCount / PageSize);
    }
}
