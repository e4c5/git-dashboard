from git import Repo
from git.exc import GitCommandError
import os


def get_default_branch(repo):
    """Determine the default branch for a repository without checking out.
    Prefers 'main' over 'master' if both exist, or uses the most recent one.
    
    Args: repo: git.Repo object
    Returns: branch name as string
    """
    branches = [ref.name for ref in repo.references if not ref.name.startswith('origin/')]
    
    # Check for common default branches
    if 'main' in branches and 'master' in branches:
        # Both exist, use the one with more recent commits
        try:
            main_commit = repo.commit('main')
            master_commit = repo.commit('master')
            return 'main' if main_commit.committed_datetime > master_commit.committed_datetime else 'master'
        except GitCommandError:
            pass
    
    if 'main' in branches:
        return 'main'
    if 'master' in branches:
        return 'master'
    
    # Try to get the HEAD reference
    try:
        if repo.head.is_detached:
            # If detached, use the current commit
            return repo.head.commit.hexsha
        else:
            # Return the current branch name
            return repo.active_branch.name
    except (GitCommandError, TypeError):
        pass
    
    # Last resort: return first available branch
    if branches:
        return branches[0]
    
    raise ValueError("No branches found in repository")


def count_lines_by_author(repo, branch=None):
    """Count lines of code by author in the given repository.
    Does not checkout or modify the working directory.
    
    Args: repo: git.Repo object
          branch: branch to analyze (if None, auto-detects default branch)
    Returns: dictionary of author names and line counts"""
    
    if branch is None:
        branch = get_default_branch(repo)
    
    lines_by_author = {}
    file_count = 0
    
    try:
        tree = repo.tree(branch)
        for item in tree.traverse():
            if item.type == 'blob':  # A file, not a directory
                file_count += 1
                try:
                    # Process blame output line by line instead of loading all at once
                    blame_output = repo.git.blame('--line-porcelain', branch, '--', item.path)
                    for line in blame_output.split('\n'):
                        if line.startswith('author '):
                            author = line[6:]
                            lines_by_author[author] = lines_by_author.get(author, 0) + 1
                    
                    # Clear blame output from memory
                    del blame_output
                    
                    if file_count % 100 == 0:
                        print(f"    Processed {file_count} files...")
                        
                except GitCommandError:
                    # Skip files that can't be blamed (binary, etc.)
                    continue
    except (GitCommandError, ValueError) as e:
        print(f"Warning: Could not analyze branch '{branch}': {e}")
    
    return lines_by_author


def get_last_modified_time(repo_path):
    repo = Repo(repo_path)
    commits = repo.iter_commits(all=True, max_count=1)
    try:
        return next(commits).committed_datetime
    except StopIteration:
        return None
    

if __name__ == '__main__':
    print(count_lines_by_author(
        open_repo('/home/raditha/workspace/python/CSI/selenium/repos/EMPI/csi-empi-api/'))       
    )