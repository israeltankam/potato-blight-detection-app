from tensorflow.keras.metrics import Metric
import tensorflow as tf

@tf.keras.utils.register_keras_serializable()
class F1Score(Metric):
    def __init__(self, name='f1_score', **kwargs):
        super(F1Score, self).__init__(name=name, **kwargs)
        self.true_positives = self.add_weight(name='tp', initializer='zeros')
        self.false_positives = self.add_weight(name='fp', initializer='zeros')
        self.false_negatives = self.add_weight(name='fn', initializer='zeros')

    def update_state(self, y_true, y_pred, sample_weight=None):
        y_true = tf.cast(y_true, tf.bool)
        y_pred = tf.cast(tf.round(y_pred), tf.bool)
        self.true_positives.assign_add(tf.reduce_sum(tf.cast(y_true & y_pred, self.dtype)))
        self.false_positives.assign_add(tf.reduce_sum(tf.cast(~y_true & y_pred, self.dtype)))
        self.false_negatives.assign_add(tf.reduce_sum(tf.cast(y_true & ~y_pred, self.dtype)))

    def result(self):
        precision = self.true_positives / (self.true_positives + self.false_positives)
        recall = self.true_positives / (self.true_positives + self.false_negatives)
        return 2 * (precision * recall) / (precision + recall)

    def reset_states(self):
        for v in self.variables:
            v.assign(tf.zeros_like(v))
