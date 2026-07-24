"""
Simple fall/no-fall classifier training script.

Usage:
  - Place your dataset as a NumPy .npz file at model_training/data.npz containing:
      X: shape (N, T, F)  -- sequences of features (e.g. angles, velocities)
      y: shape (N,)       -- binary labels (0 = no-fall, 1 = fall)

  - If no dataset is present, the script will generate a synthetic dataset for testing.

  - Train and create a SavedModel in `model_training/saved_model/`.

  - Convert to TF.js format for browser inference:
      pip install tensorflowjs
      tensorflowjs_converter --input_format=tf_saved_model \
        model_training/saved_model/ public/vendor/fall_model

Notes:
  - Intended as a starting point. Replace synthetic data with real labeled sequences.
  - Sequence feature engineering: use angles between shoulder/hip, velocities, head height ratio, etc.
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks

OUT_DIR = os.path.join(os.path.dirname(__file__), 'saved_model')
DATA_PATH = os.path.join(os.path.dirname(__file__), 'data.npz')

SEED = 123
np.random.seed(SEED)

SEQ_LEN = 30
FEATURES = 1


def generate_synthetic(n_samples=2000, seq_len=SEQ_LEN):
    """Generate synthetic sequences of an "angle" feature.
    - no-fall: small random jitter around low angle (0-20)
    - fall: small jitter but with a sustained high-angle spike in middle/near-end
    """
    X = np.zeros((n_samples, seq_len, FEATURES), dtype=np.float32)
    y = np.zeros((n_samples,), dtype=np.int32)

    for i in range(n_samples):
        is_fall = np.random.rand() < 0.25
        y[i] = 1 if is_fall else 0
        base = np.random.normal(loc=10.0, scale=3.0, size=(seq_len,))
        if is_fall:
            # place a spike of elevated angles
            start = np.random.randint(seq_len // 2, seq_len - 5)
            length = np.random.randint(3, 8)
            spike = np.linspace(35, 70, length) + np.random.normal(0, 5, size=(length,))
            base[start:start+length] += spike
        base += np.random.normal(0, 1.5, size=(seq_len,))
        X[i, :, 0] = np.clip(base, 0, 180)

    # normalize to 0..1
    X = X / 180.0
    return X, y


def load_dataset():
    if os.path.exists(DATA_PATH):
        print('Loading dataset from', DATA_PATH)
        data = np.load(DATA_PATH)
        X = data['X']
        y = data['y']
        return X, y
    print('No dataset found - generating synthetic data')
    return generate_synthetic(n_samples=2000)


def build_model(input_shape):
    model = models.Sequential()
    model.add(layers.Input(shape=input_shape))
    model.add(layers.Masking(mask_value=0.0))
    model.add(layers.LSTM(48, return_sequences=True))
    model.add(layers.LSTM(32))
    model.add(layers.Dense(32, activation='relu'))
    model.add(layers.Dropout(0.3))
    model.add(layers.Dense(1, activation='sigmoid'))
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    return model


def main():
    X, y = load_dataset()
    print('X shape', X.shape, 'y shape', y.shape)

    # split
    idx = np.arange(len(X))
    np.random.shuffle(idx)
    train_idx = idx[:int(0.8 * len(idx))]
    val_idx = idx[int(0.8 * len(idx)):int(0.9 * len(idx))]
    test_idx = idx[int(0.9 * len(idx)):]

    X_train, y_train = X[train_idx], y[train_idx]
    X_val, y_val = X[val_idx], y[val_idx]
    X_test, y_test = X[test_idx], y[test_idx]

    model = build_model(input_shape=X.shape[1:])
    model.summary()

    cb = [
        callbacks.EarlyStopping(monitor='val_loss', patience=6, restore_best_weights=True),
    ]

    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=50,
        batch_size=64,
        callbacks=cb,
    )

    # evaluate
    loss, acc = model.evaluate(X_test, y_test, verbose=0)
    print(f'Test loss={loss:.4f} acc={acc:.4f}')

    # save SavedModel
    print('Saving model to', OUT_DIR)
    model.save(OUT_DIR, include_optimizer=False)
    print('Saved. Convert to TF.js with:')
    print('  pip install tensorflowjs')
    print('  tensorflowjs_converter --input_format=tf_saved_model', OUT_DIR, 'public/vendor/fall_model')


if __name__ == '__main__':
    main()
