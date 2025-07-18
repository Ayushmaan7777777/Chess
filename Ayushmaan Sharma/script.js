const boardElement = document.getElementById('chessboard');

// Initial board setup
let board = [
  ['♜','♞','♝','♛','♚','♝','♞','♜'],
  ['♟','♟','♟','♟','♟','♟','♟','♟'],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['♙','♙','♙','♙','♙','♙','♙','♙'],
  ['♖','♘','♗','♕','♔','♗','♘','♖']
];

let selected = null;
let whiteToMove = true;

// Utility functions
function isWhite(piece) {
  return '♔♕♖♗♘♙'.includes(piece);
}

function isBlack(piece) {
  return '♚♛♜♝♞♟'.includes(piece);
}

// Find king position
function findKing(isWhitePlayer) {
  const kingSymbol = isWhitePlayer ? '♔' : '♚';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === kingSymbol) return { row, col };
    }
  }
  return null;
}

// Check if player is in check
function isInCheck(isWhitePlayer) {
  const king = findKing(isWhitePlayer);
  if (!king) return false;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      if ((isWhitePlayer && isBlack(piece)) || (!isWhitePlayer && isWhite(piece))) {
        if (isValidMove(r, c, king.row, king.col, true)) return true;
      }
    }
  }
  return false;
}

// Check if path is clear for sliding pieces
function isPathClear(fromRow, fromCol, toRow, toCol) {
  let rowStep = Math.sign(toRow - fromRow);
  let colStep = Math.sign(toCol - fromCol);
  let r = fromRow + rowStep;
  let c = fromCol + colStep;

  while (r !== toRow || c !== toCol) {
    if (board[r][c] !== '') return false;
    r += rowStep;
    c += colStep;
  }
  return true;
}

// Validate individual moves (with optional check skip)
function isValidMove(fromRow, fromCol, toRow, toCol, skipCheck = false) {
  const piece = board[fromRow][fromCol];
  const destPiece = board[toRow][toCol];
  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;

  if (!piece) return false;
  if (destPiece && ((isWhite(piece) && isWhite(destPiece)) || (isBlack(piece) && isBlack(destPiece)))) return false;

  let valid = false;

  switch (piece) {
    case '♙': // White pawn
      if (colDiff === 0 && rowDiff === -1 && destPiece === '') valid = true;
      else if (colDiff === 0 && rowDiff === -2 && fromRow === 6 && board[5][fromCol] === '' && destPiece === '') valid = true;
      else if (Math.abs(colDiff) === 1 && rowDiff === -1 && destPiece!='') valid = true;
      break;
    case '♟': // Black pawn
      if (colDiff === 0 && rowDiff === 1 && destPiece === '') valid = true;
      else if (colDiff === 0 && rowDiff === 2 && fromRow === 1 && board[2][fromCol] === '' && destPiece === '') valid = true;
      else if (Math.abs(colDiff) === 1 && rowDiff === 1 && destPiece!= '') valid = true;
      break;
    case '♖': case '♜':
      if ((rowDiff === 0 || colDiff === 0) && isPathClear(fromRow, fromCol, toRow, toCol)) valid = true;
      break;
    case '♗': case '♝':
      if (Math.abs(rowDiff) === Math.abs(colDiff) && isPathClear(fromRow, fromCol, toRow, toCol)) valid = true;
      break;
    case '♕': case '♛':
      if ((rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) && isPathClear(fromRow, fromCol, toRow, toCol)) valid = true;
      break;
    case '♘': case '♞':
      if ((Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) || (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)) valid = true;
      break;
    case '♔': case '♚':
      if (Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1) valid = true;
      break;
  }

  // Check king safety unless skipCheck is true
  if (valid && !skipCheck) {
    const tempFrom = board[fromRow][fromCol];
    const tempTo = board[toRow][toCol];

    board[toRow][toCol] = tempFrom;
    board[fromRow][fromCol] = '';

    const inCheck = isInCheck(isWhite(tempFrom));

    board[fromRow][fromCol] = tempFrom;
    board[toRow][toCol] = tempTo;

    if (inCheck) return false;
  }

  return valid;
}

// Get all legal moves for a piece
function getLegalMoves(row, col) {
  const moves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (isValidMove(row, col, r, c)) {
        moves.push({ r, c });
      }
    }
  }
  return moves;
}

// Render board with highlights
function renderBoard() {
  boardElement.innerHTML = '';
  const highlights = selected ? getLegalMoves(selected.row, selected.col) : [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement('div');
      square.className = 'square ' + ((row + col) % 2 === 0 ? 'light' : 'dark');
      square.dataset.row = row;
      square.dataset.col = col;
      square.textContent = board[row][col];

      if (selected && selected.row === row && selected.col === col) {
        square.classList.add('selected');
      }

      if (highlights.some(m => m.r === row && m.c === col)) {
        square.classList.add('highlight');
      }

      square.addEventListener('click', () => handleClick(row, col));
      boardElement.appendChild(square);
    }
  }
}

function hasLegalMoves(isWhitePlayer) {
  for (let fromRow = 0; fromRow < 8; fromRow++) {
    for (let fromCol = 0; fromCol < 8; fromCol++) {
      const piece = board[fromRow][fromCol];
      if (piece === '') continue;
      if ((isWhitePlayer && isWhite(piece)) || (!isWhitePlayer && isBlack(piece))) {
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            if (isValidMove(fromRow, fromCol, toRow, toCol)) {
              return true; // Found at least one legal move
            }
          }
        }
      }
    }
  }
  return false;
}


function handleClick(row, col) {
  const piece = board[row][col];
  const messageBox = document.getElementById('message');

  if (selected) {
    if (isValidMove(selected.row, selected.col, row, col)) {
      board[row][col] = board[selected.row][selected.col];
      board[selected.row][selected.col] = '';
      whiteToMove = !whiteToMove;
      selected = null;

      const opponentInCheck = isInCheck(whiteToMove);
      const opponentHasMoves = hasLegalMoves(whiteToMove);
      if (opponentInCheck && !opponentHasMoves) {
        // Show winner color with styling
        if (whiteToMove) {
          messageBox.innerHTML = '<span style="color:#0074D9;">Black wins by checkmate!</span>';
        } else {
          messageBox.innerHTML = '<span style="color:#0074D9;">White wins by checkmate!</span>';
        }
      } else if (!opponentHasMoves) {
        messageBox.textContent = 'Stalemate! It\'s a draw.';
      } else if (opponentInCheck) {
        messageBox.textContent = 'Check!';
      } else {
        messageBox.textContent = '';
      }
    } else {
      selected = null;
      messageBox.textContent = '';
    }
  } else {
    if (piece !== '' && ((whiteToMove && isWhite(piece)) || (!whiteToMove && isBlack(piece)))) {
      selected = { row, col };
      messageBox.textContent = '';
    }
  }

  renderBoard();
}


renderBoard();
