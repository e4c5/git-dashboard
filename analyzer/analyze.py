from git import Repo
import os
from datetime import datetime

def open_repo(repo_path):
    if os.path.exists(repo_path):
        # Create a Repo object
        repo = Repo(repo_path)
        return repo

def get_commits(repo, timestamp=None):
    for commit in repo.iter_commits('HEAD', max_count=100000):
        # Check if a timestamp was provided and if the commit is newer than this timestamp
        if timestamp is None or commit.committed_datetime > datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S'):
            # Extract details
            author = commit.author.name
            commit_hash = commit.hexsha
            commit_timestamp = commit.committed_datetime

            # Print or store these details
            print(f'Author: {author}, Commit Hash: {commit_hash}, Timestamp: {commit_timestamp}')

def count_lines_by_author(repo, branch='master'):
    lines_by_author = {}
    for item in repo.tree(branch).traverse():
        if item.type == 'blob':  # A file, not a directory
            blame_stats = repo.git.blame('--line-porcelain', branch, item.path).split('\n')
            for line in blame_stats:
                if line.startswith('author '):
                    author = line[6:]
                    lines_by_author[author] = lines_by_author.get(author, 0) + 1
    return lines_by_author


print(count_lines_by_author(
    open_repo('/home/raditha/workspace/python/CSI/selenium/repos/EMPI/csi-empi-api/'))       
)