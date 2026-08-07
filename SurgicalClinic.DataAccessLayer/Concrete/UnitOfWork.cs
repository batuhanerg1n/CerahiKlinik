using SurgicalClinic.DataAccessLayer.Abstract;
using SurgicalClinic.DataAccessLayer.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.DataAccessLayer.Concrete
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        private readonly Dictionary<Type, object> _repositories = new();

        public UnitOfWork(AppDbContext context)
        {
            _context = context;
        }

        public async ValueTask DisposeAsync()
        {
            await _context.DisposeAsync();
        }

        public IGenericRepository<T> GetRepository<T>() where T : class
        {
            var type=typeof(T);
            if (!_repositories.ContainsKey(type)) 
            {
                var repositoryInstance= new GenericRepository<T>(_context);
                _repositories.Add(type, repositoryInstance);
            }
            return(IGenericRepository<T>)_repositories[type];
        }

        public async Task<int> SaveChangeAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}
