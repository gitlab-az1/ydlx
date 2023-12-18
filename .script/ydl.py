import platform
from os import path
from pytube import YouTube
from sys import argv, exit
from subprocess import run as _exec


CLEAR_CONSOLE = lambda: _exec('cls' if platform.system() == 'Windows' else 'clear', shell=True)

def parse_arguments() -> dict[str]:
  results = {}
    
  for i, arg in enumerate(argv):
    if i == 0:
      continue

    try:
      arg = str(arg)
    except ValueError:
      continue

    if arg.startswith('--'):
      if i + 1 < len(argv) and not argv[i + 1].startswith('-'):
        results[arg] = argv[i + 1]
      else:
        results[arg] = True
    elif arg.startswith('-'):
      if i + 1 < len(argv) and not argv[i + 1].startswith('-'):
        results[arg] = argv[i + 1]
      else:
        results[arg] = True

  return results

def main() -> None:
  args = parse_arguments()

  if not args.get('--video_id') and not args.get('-v'):
    CLEAR_CONSOLE()
    print('[required_argument_not_found] (error) Please provide a video id.')
    return exit()

  VIDEO_ID = args.get('--video_id') or args.get('-v')
  OVERWRITE = args.get('--overwrite') == True

  try:
    VIDEO = YouTube(url=f"https://youtube.com/watch?v={VIDEO_ID}")
    
    try:
      VIDEO.bypass_age_gate()
    except:
      pass
    
    stream = None

    if str(args.get('--resolution')).endswith('p'):
      try:
        stream = VIDEO.streams.get_by_resolution(args.get('--resolution'))

        if stream is None:
          stream = (
            VIDEO.streams.get_lowest_resolution() if 
            args.get('--resolution-fallback') == 'lowest' or args.get('-r') == 'lowest' else
            VIDEO.streams.get_highest_resolution()
          )
      except:
        stream = (
          VIDEO.streams.get_lowest_resolution() if 
          args.get('--resolution-fallback') == 'lowest' or args.get('-r') == 'lowest' else
          VIDEO.streams.get_highest_resolution()
        )
    else:
      stream = (
        VIDEO.streams.get_lowest_resolution() if 
        args.get('--resolution') == 'lowest' or args.get('-r') == 'lowest' else
        VIDEO.streams.get_highest_resolution()
      )

    if stream is None:
      resolution_string = "" + args.get('--resolution') + ":" + args.get('--resolution-fallback')
      print(f"[execution_error] (error) Failed to get a download stream for video `{VIDEO_ID}` with resolution {resolution_string}")
      return exit()

    script_directory = path.dirname(path.realpath(__file__))
    output_path = args.get('--out') or path.join(script_directory, '../out/').replace('/..', '')
    
    stream.download(
      skip_existing=(OVERWRITE == False),
      filename=(f"{VIDEO_ID}.ydl-cbr.mp4"),
      output_path=output_path
    )

    print(f'[done] (success) Downloaded video `{VIDEO_ID}` to `{output_path}`')
  except Exception as err:
    CLEAR_CONSOLE()
    print(f'[execution_error] (error) {err}')
    return exit()


if __name__ == '__main__':
  main()