import React from 'react';

// Assuming 'repo' is the object containing repository information
const RepositoryCard = ({ repo }) => {
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div className="md:flex">
        <div className="md:flex-shrink-0">
          <img className="h-48 w-full object-cover md:w-48" src={repo.owner.avatar_url} alt="Owner's avatar" />
        </div>
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{repo.name}</div>
          <a href={repo.html_url} className="block mt-1 text-lg leading-tight font-medium text-black hover:underline">{repo.full_name}</a>
          <p className="mt-2 text-gray-500">{repo.description || "No description available"}</p>
          <div className="mt-4">
            <span className="text-gray-600 mr-2">
              <i className="fas fa-star"></i> {repo.stargazers_count}
            </span>
            <span className="text-gray-600 mr-2">
              <i className="fas fa-code-branch"></i> {repo.forks_count}
            </span>
            <span className="text-gray-600">
              <i className="fas fa-code"></i> {repo.language}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepositoryCard;
