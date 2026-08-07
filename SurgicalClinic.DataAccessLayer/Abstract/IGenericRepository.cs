using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.DataAccessLayer.Abstract
{
    public interface IGenericRepository<T> where T: class
    {
        Task<T?> GetByIdAsync(int id);
        Task<IEnumerable<T>> GetAllAsync();
        IQueryable<T> GetWhere(Expression<Func<T,bool>> predicate);
        Task AddAsync(T entity);
        void Remove(T entity);
        void Update(T entity);
    }
}
