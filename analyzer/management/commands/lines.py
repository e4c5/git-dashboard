import os
from typing import Any
from django.core.management.base import BaseCommand
from analyzer.models import Project, Repository, Commit, Author, Contrib, Alias

class Command(BaseCommand):
    """A management command to count lines"""
    def add_arguments(self, parser):
        parser.add_argument('location', type=str)
        parser.add_argument('--binary-log', type=str, help='Path to log file for binary files')
        parser.add_argument('--non-binary-log', type=str, help='Path to log file for non-binary files')

    def handle(self, *args: Any, **options: Any):
        """Inspects files in the given location to find the total number of
        lines in them, including subdirectories. Binary files are excluded but the 
        size of each binary file will logged along with the path to the file."""
        
        location = options['location']
        
        binary_log_path = options['binary_log'] or '/dev/null'
        non_binary_log_path = options['non_binary_log'] or '/dev/null'

        total_lines = 0
        with open(non_binary_log_path, 'w') as log:
            with open(binary_log_path, 'w') as bin_log:
                for root, dirs, files in os.walk(location):
                    dirs[:] = [d for d in dirs if d != '.git']  # Exclude .git directories
                    for file in files:
                        file_path = os.path.join(root, file)
                        if os.path.isfile(file_path):
                            try:
                                with open(file_path, 'r') as f:
                                    lines = len(f.readlines())
                                    total_lines += lines
                                    log.write(f'{file_path.replace(location,'')},{lines},{os.path.getsize(file_path)}\n')
                            except UnicodeDecodeError:
                                    bin_log.write(f'{file_path.replace(location,'')},{os.path.getsize(file_path)}\n')

        print(f'Total lines: {total_lines}')