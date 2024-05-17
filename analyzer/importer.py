from git import Repo
import os


def open_repo(repo_path):
    if os.path.exists(repo_path):
        # Create a Repo object
        repo = Repo(repo_path)
        return repo

def get_commits(repo, timestamp=None):
    for commit in repo.iter_commits('HEAD', max_count=100000):
        # Check if a timestamp was provided and if the commit is newer than this timestamp
        if timestamp is None or commit.committed_datetime > timestamp:
            yield commit

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


def get_last_modified_time(repo_path):
    repo = Repo(repo_path)
    commits = repo.iter_commits('master', max_count=1)
    try:
        return next(commits).committed_datetime
    except StopIteration:
        return None
    

if __name__ == '__main__':
    print(count_lines_by_author(
        open_repo('/home/raditha/workspace/python/CSI/selenium/repos/EMPI/csi-empi-api/'))       
    )