var board, boardEl, game = new Chess(), squareToHighlight, positionCount;

var removeGreySquares = function () {
  $('#board .square-55d63').css('background', '');
};

var greySquare = function (square) {
  var squareEl = $('#board .square-' + square);
  var background = '#a9a9a9';
  if (squareEl.hasClass('black-3c85d') === true) {
    background = '#696969';
  }
  squareEl.css('background', background);
};

var removeHighlights = function (color) {
  boardEl.find('.square-55d63').removeClass('highlight-' + color);
};

// 计算棋盘子力
var evaluateBoard = function (board) {
  var totalEvaluation = 0;
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      totalEvaluation = totalEvaluation + getPieceValue(board[i][j], i, j);
    }
  }
  return totalEvaluation;
};
// 子力值
var getPieceValue = function (piece, x, y) {
  if (piece === null) {
    return 0;
  }
  var getAbsoluteValue = function (piece, isWhite, x, y) {
    if (piece.type === 'p') {
      return 10 + (isWhite ? pawnEvalWhite[y][x] : pawnEvalBlack[y][x]);
    } else if (piece.type === 'r') {
      return 50 + (isWhite ? rookEvalWhite[y][x] : rookEvalBlack[y][x]);
    } else if (piece.type === 'n') {
      return 30 + knightEval[y][x];
    } else if (piece.type === 'b') {
      return 30 + (isWhite ? bishopEvalWhite[y][x] : bishopEvalBlack[y][x]);
    } else if (piece.type === 'q') {
      return 90 + evalQueen[y][x];
    } else if (piece.type === 'k') {
      return 900 + (isWhite ? kingEvalWhite[y][x] : kingEvalBlack[y][x]);
    }
    throw 'Unknown piece type: ' + piece.type;
  }
  var absoluteValue = getAbsoluteValue(piece, piece.color === 'w', x, y);
  return piece.color === 'w' ? absoluteValue : -absoluteValue;
};

// The AI part starts here
var minmaxRoot = function (depth, isMaximisingPlayer) {
  var moves = game.moves({ verbose: true });
  var bestMove = -9999;
  var bestMoveFound;

  for (var i = 0; i < moves.length; i++) {
    var move = moves[i];
    game.move(move.san);
    var value = minmax(depth - 1, -10000, 10000, !isMaximisingPlayer);
    game.undo();
    if (value >= bestMove) {
      bestMove = value;
      bestMoveFound = move;
    }
  }
  return bestMoveFound;
};

var minmax = function (depth, alpha, beta, isMaximisingPlayer) {
  positionCount++;
  if (depth === 0) {
    return -evaluateBoard(game.board());
  }

  var moves = game.moves({ verbose: true });

  if (isMaximisingPlayer) {
    var bestMove = -9999;
    for (var i = 0; i < moves.length; i++) {
      game.move(moves[i].san);
      bestMove = Math.max(bestMove, minmax(depth - 1, alpha, beta, !isMaximisingPlayer));
      game.undo();
      alpha = Math.max(alpha, bestMove);
      if (beta <= alpha) {
        return bestMove;
      }
    }
    return bestMove;
  } else {
    var bestMove = 9999;
    for (var i = 0; i < moves.length; i++) {
      game.move(moves[i].san);
      bestMove = Math.min(bestMove, minmax(depth - 1, alpha, beta, !isMaximisingPlayer));
      game.undo();
      beta = Math.min(beta, bestMove);
      if (beta <= alpha) {
        return bestMove;
      }
    }
    return bestMove;
  }
};

var calculateBestMove = function () {
  if (game.game_over()) {
    alert('Game over');
  }

  positionCount = 0;
  var depth = 3;

  var d = new Date().getTime();
  var bestMove = minmaxRoot(depth, true);
  var d2 = new Date().getTime();
  var moveTime = d2 - d;
  var positionsPerS = positionCount * 1000 / moveTime;
  console.log('moveTime:', moveTime);
  console.log('positionsPerS:', positionsPerS);

  game.move(bestMove.san);

  // highlight black's move
  removeHighlights('black');
  boardEl.find('.square-' + bestMove.from).addClass('highlight-black');
  squareToHighlight = bestMove.to;

  // update the board to the new position
  board.position(game.fen());
};

// 子力位置矩阵
var reverseArray = function (array) {
  return array.slice().reverse();
};

var pawnEvalWhite = [
  [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
  [5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
  [1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
  [0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
  [0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
  [0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
  [0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
  [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
];
var pawnEvalBlack = reverseArray(pawnEvalWhite);
var knightEval = [
  [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
  [-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
  [-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
  [-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
  [-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
  [-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
  [-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
  [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
];
var bishopEvalWhite = [
  [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
  [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
  [ -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
  [ -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
  [ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
  [ -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
  [ -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
  [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
];
var bishopEvalBlack = reverseArray(bishopEvalWhite);
var rookEvalWhite = [
  [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
  [  0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [  0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
];
var rookEvalBlack = reverseArray(rookEvalWhite);
var evalQueen = [
  [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
  [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
  [ -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
  [ -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
  [  0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
  [ -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
  [ -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
  [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
];
var kingEvalWhite = [
  [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [ -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
  [ -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
  [  2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0 ],
  [  2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0 ]
];
var kingEvalBlack = reverseArray(kingEvalWhite);

$(function () {
  boardEl = $('#board');

  // do not pick up pieces if the game is over
  // only pick up pieces for White
  var onDragStart = function (source, piece) {
    if (game.game_over() === true ||
      (game.turn() === 'b' && piece.search('/^w/') !== -1)) {
      return false;
    }
  };

  var onDrop = function (source, target) {
    removeGreySquares();

    // see if the move is legal
    var move = game.move({
      from: source,
      to: target,
      promotion: 'q' // NOTE: always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return 'snapback';

    // highlight white's move
    removeHighlights('white');
    boardEl.find('.square-' + source).addClass('highlight-white');
    boardEl.find('.square-' + target).addClass('highlight-white');

    // calculate best move for black
    window.setTimeout(calculateBestMove, 250);
  };

  var onMoveEnd = function () {
    boardEl.find('.square-' + squareToHighlight).addClass('highlight-black');
  };

  var onMouseoverSquare = function (square, piece) {
    // get list of possible moves for this square
    var moves = game.moves({
      square: square,
      verbose: true
    });

    // exit if there are no moves available for this square
    if (moves.length === 0) return;

    // highlight the square they moused over
    greySquare(square);

    // highlight the possible squares for this piece
    for (var i = 0; i < moves.length; i++) {
      greySquare(moves[i].to);
    }
  };

  var onMouseoutSquare = function (square, piece) {
    removeGreySquares();
  };

  // update the board position after the piece snap
  // for castling, en passant, pawn promotion
  var onSnapEnd = function () {
    board.position(game.fen());
  };

  var cfg = {
    draggable: true,
    position: 'start',
    onDragStart,
    onDrop,
    onMoveEnd,
    onMouseoutSquare,
    onMouseoverSquare,
    onSnapEnd
  };
  board = ChessBoard('board', cfg);
});
