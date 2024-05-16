from git import Repo
import os
from datetime import datetime

def get_commits(repo_path, timestamp=None):
    # Ensure the path exists
    if os.path.exists(repo_path):
        # Create a Repo object
        repo = Repo(repo_path)

        # Iterate over all commits in all branches
        for commit in repo.iter_commits('HEAD', max_count=100000):
            # Check if a timestamp was provided and if the commit is newer than this timestamp
            if timestamp is None or commit.committed_datetime > datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S'):
                # Extract details
                author = commit.author.name
                commit_hash = commit.hexsha
                commit_timestamp = commit.committed_datetime

                # Print or store these details
                print(f'Author: {author}, Commit Hash: {commit_hash}, Timestamp: {commit_timestamp}')
    else:
        print("The path does not exist")


get_commits('/home/raditha/workspace/python/CSI/selenium/repos/EMPI/csi-empi-wrapper/')        